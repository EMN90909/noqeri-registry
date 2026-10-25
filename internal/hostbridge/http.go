// SPDX-License-Identifier: MIT
package hostbridge

import (
	"context"
	"crypto/tls"
	"errors"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var providerHosts = map[string][]string{
	"auth0": {".auth0.com"}, "clerk": {"api.clerk.com"},
	"cloudflare": {"api.cloudflare.com"}, "convex": {".convex.cloud", ".convex.site"},
	"firebase": {"identitytoolkit.googleapis.com", "securetoken.googleapis.com", "firestore.googleapis.com"},
	"github":   {"api.github.com"}, "neon": {"console.neon.tech"},
	"openai": {"api.openai.com"}, "planetscale": {"api.planetscale.com"},
	"resend": {"api.resend.com"}, "sentry": {"sentry.io", ".sentry.io"},
	"stripe": {"api.stripe.com"}, "supabase": {"api.supabase.com", ".supabase.co"},
}

// HTTPHost keeps the network enforcement separate from the Noqeri compiler.
type HTTPHost struct {
	Client               *http.Client
	AllowPrivateForTests bool
}

func NewHTTPHost() *HTTPHost { return &HTTPHost{} }
func allowedHost(provider, hostname string) bool {
	values, exists := providerHosts[provider]
	if !exists {
		return false
	}
	hostname = strings.ToLower(hostname)
	for _, allowed := range values {
		if strings.HasPrefix(allowed, ".") {
			if strings.HasSuffix(hostname, allowed) && len(hostname) > len(allowed) {
				return true
			}
		} else if hostname == allowed {
			return true
		}
	}
	return false
}
func publicIP(ip net.IP) bool {
	if ip == nil || !ip.IsGlobalUnicast() || ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() {
		return false
	}
	// Extra non-public ranges not covered by net.IP.IsPrivate.
	for _, s := range []string{"100.64.0.0/10", "192.0.0.0/24", "192.0.2.0/24", "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "240.0.0.0/4", "2001:db8::/32", "fc00::/7", "fe80::/10"} {
		_, block, _ := net.ParseCIDR(s)
		if block.Contains(ip) {
			return false
		}
	}
	return true
}
func (h *HTTPHost) client() *http.Client {
	if h.Client != nil {
		return h.Client
	}
	// Resolve and pin an allowed public IP at connection time to prevent DNS rebinding.
	transport := &http.Transport{
		TLSClientConfig:       &tls.Config{MinVersion: tls.VersionTLS12},
		Proxy:                 nil,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          8,
		MaxIdleConnsPerHost:   2,
		IdleConnTimeout:       15 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 8 * time.Second,
		DisableCompression:    true,
	}
	transport.DialContext = func(ctx context.Context, network, address string) (net.Conn, error) {
		host, port, err := net.SplitHostPort(address)
		if err != nil {
			return nil, errors.New("invalid_destination")
		}
		if port != "443" {
			return nil, errors.New("invalid_destination")
		}
		records, err := net.DefaultResolver.LookupIPAddr(ctx, host)
		if err != nil {
			return nil, errors.New("dns_failed")
		}
		dialer := net.Dialer{Timeout: 5 * time.Second}
		for _, record := range records {
			if !publicIP(record.IP) {
				continue
			}
			return dialer.DialContext(ctx, network, net.JoinHostPort(record.IP.String(), port))
		}
		return nil, errors.New("no_public_destination")
	}
	return &http.Client{Transport: transport, Timeout: 10 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
}
func (h *HTTPHost) Execute(ctx context.Context, m Message, env EnvFunc) (int, string, error) {
	allowed := map[string]bool{"GET": true, "POST": true, "PATCH": true, "PUT": true, "DELETE": true, "HEAD": true}
	if !allowed[m.Method] {
		return 0, "", errors.New("invalid_method")
	}
	if len(m.URL) < 12 || len(m.URL) > 4096 || len(m.Body) > 1<<20 {
		return 0, "", errors.New("request_too_large")
	}
	u, err := url.Parse(m.URL)
	if err != nil || u.Scheme != "https" || u.Hostname() == "" || u.User != nil || u.Fragment != "" || u.Opaque != "" {
		return 0, "", errors.New("invalid_url")
	}
	if u.Port() != "" && u.Port() != "443" {
		return 0, "", errors.New("invalid_port")
	}
	if !allowedHost(m.Provider, u.Hostname()) {
		return 0, "", errors.New("provider_host_not_allowed")
	}
	if net.ParseIP(u.Hostname()) != nil {
		return 0, "", errors.New("literal_ip_denied")
	}
	if strings.ContainsAny(u.Hostname(), "\\ %\n\r") || strings.Contains(strings.ToLower(u.EscapedPath()), "%2f") || strings.Contains(strings.ToLower(u.EscapedPath()), "%5c") {
		return 0, "", errors.New("invalid_url")
	}
	envName := "NOQERI_" + strings.ToUpper(strings.ReplaceAll(m.Provider, "-", "_")) + "_TOKEN"
	key := env(envName)
	if len(key) < 8 || len(key) > 8192 || strings.ContainsAny(key, "\r\n") {
		return 0, "", errors.New("provider_secret_unavailable")
	}
	req, err := http.NewRequestWithContext(ctx, m.Method, u.String(), strings.NewReader(m.Body))
	if err != nil {
		return 0, "", errors.New("invalid_request")
	}
	req.Header.Set("User-Agent", "noqeri-go-host/1")
	req.Header.Set("Accept", "application/json")
	if m.Provider == "supabase" && strings.HasSuffix(u.Hostname(), ".supabase.co") {
		// New sb_secret_/sb_publishable_ keys are opaque gateway keys, not JWTs.
		req.Header.Set("apikey", key)
		if jwt := env("NOQERI_SUPABASE_JWT"); len(jwt) > 12 && len(jwt) < 8192 && !strings.ContainsAny(jwt, "\r\n") {
			req.Header.Set("Authorization", "Bearer "+jwt)
		}
	} else if m.Provider == "planetscale" {
		// PlanetScale service tokens use "service_token_id:service_token", not Bearer.
		tokenID := env("NOQERI_PLANETSCALE_TOKEN_ID")
		if len(tokenID) < 6 || len(tokenID) > 128 || strings.ContainsAny(tokenID, ":\r\n") {
			return 0, "", errors.New("planetscale_token_id_missing")
		}
		req.Header.Set("Authorization", tokenID+":"+key)
	} else if m.Provider == "firebase" && (u.Hostname() == "identitytoolkit.googleapis.com" || u.Hostname() == "securetoken.googleapis.com") {
		// These REST APIs require a project API key in the query string.
		values := u.Query()
		values.Set("key", key)
		req.URL.RawQuery = values.Encode()
	} else {
		req.Header.Set("Authorization", "Bearer "+key)
	}
	if m.Provider == "stripe" {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		if m.Method == "POST" {
			if v := env("NOQERI_STRIPE_IDEMPOTENCY_KEY"); len(v) > 0 && len(v) <= 255 && !strings.ContainsAny(v, "\r\n") {
				req.Header.Set("Idempotency-Key", v)
			}
		}
	} else if m.Body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	// No user-provided headers or dynamic secret names. Do not log requests.
	client := h.client()
	response, err := client.Do(req)
	if err != nil {
		return 0, "", errors.New("upstream_unavailable")
	}
	defer response.Body.Close()
	if response.StatusCode < 100 || response.StatusCode > 599 {
		return 0, "", errors.New("invalid_upstream_status")
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, 1<<20+1))
	if err != nil {
		return response.StatusCode, "", errors.New("upstream_read_failed")
	}
	if len(body) > 1<<20 {
		return response.StatusCode, "", errors.New("upstream_body_too_large")
	}
	return response.StatusCode, string(body), nil
}

// Avoid silently accepting port notation like 443.0.
