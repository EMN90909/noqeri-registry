// SPDX-License-Identifier: MIT
package hostbridge

import (
    "context"
    "io"
    "net/http"
    "strings"
    "testing"
)

// These are entirely in-memory transport tests. They never contact a provider,
// require a developer token, or execute GitHub Actions.
func TestExpandedProviderHostIsolation(t *testing.T) {
    engine := NewEngine()
    engine.Env = envValues(map[string]string{
        "NOQERI_VERCEL_TOKEN": "vercel-testing-token",
        "NOQERI_TURSO_TOKEN": "turso-management-token",
        "NOQERI_TURSO_HOST": "demo-org.turso.io",
        "NOQERI_TURSO_DATABASE_TOKEN": "turso-database-token",
        "NOQERI_UPSTASH_HOST": "demo.upstash.io",
        "NOQERI_UPSTASH_TOKEN": "upstash-testing-token",
    })
    calls := 0
    engine.HTTP.Client = &http.Client{Transport: fakeTransport(func(request *http.Request) (*http.Response, error) {
        calls++
        expected := map[string]string{
            "api.vercel.com": "Bearer vercel-testing-token",
            "api.turso.tech": "Bearer turso-management-token",
            "demo-org.turso.io": "Bearer turso-database-token",
            "demo.upstash.io": "Bearer upstash-testing-token",
        }[request.URL.Hostname()]
        if expected == "" {
            t.Errorf("unapproved outbound host reached transport: %s", request.URL.Hostname())
        }
        if got := request.Header.Get("Authorization"); got != expected {
            t.Errorf("credential isolation failure: host=%s got=%q", request.URL.Hostname(), got)
        }
        return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader("{}")), Header: make(http.Header)}, nil
    })}
    for _, tc := range []struct{ provider, url string }{
        {"vercel", "https://api.vercel.com/v9/projects"},
        {"turso", "https://api.turso.tech/v1/organizations"},
        {"turso", "https://demo-org.turso.io/v2/pipeline"},
        {"upstash", "https://demo.upstash.io/pipeline"},
    } {
        response := engine.Dispatch(context.Background(), Message{
            Version: 1, Op: "http", Provider: tc.provider, Method: "GET", URL: tc.url,
        })
        if !response.OK || response.Status != 200 {
            t.Errorf("approved provider failed %s: %+v", tc.provider, response)
        }
    }
    for _, tc := range []struct{ provider, url string }{
        {"vercel", "https://api.vercel.com.evil.test/"},
        {"vercel", "http://api.vercel.com/v9/projects"},
        {"vercel", "https://user@api.vercel.com/v9/projects"},
        {"turso", "https://wrong-org.turso.io/v2/pipeline"},
        {"turso", "https://demo-org.turso.io.evil.test/v2/pipeline"},
        {"upstash", "https://wrong.upstash.io/pipeline"},
        {"upstash", "https://demo.upstash.io.evil.test/pipeline"},
        {"upstash", "https://demo.upstash.io:8080/pipeline"},
    } {
        response := engine.Dispatch(context.Background(), Message{
            Version: 1, Op: "http", Provider: tc.provider, Method: "GET", URL: tc.url,
        })
        if response.OK {
            t.Errorf("unsafe provider request accepted: %+v", tc)
        }
    }
    if calls != 4 {
        t.Fatalf("unsafe requests crossed the trusted HTTP boundary: calls=%d", calls)
    }
}

func TestExpandedProviderRequiresConfiguredTenantAndSeparateDatabaseToken(t *testing.T) {
    engine := NewEngine()
    engine.Env = envValues(map[string]string{
        "NOQERI_TURSO_TOKEN": "organization-token",
        "NOQERI_TURSO_HOST": "demo-org.turso.io",
        "NOQERI_UPSTASH_TOKEN": "upstash-example-token",
    })
    engine.HTTP.Client = &http.Client{Transport: fakeTransport(func(*http.Request) (*http.Response, error) {
        t.Fatal("unconfigured tenant or database credential must not reach transport")
        return nil, nil
    })}
    for _, tc := range []struct{ provider, url string }{
        {"upstash", "https://demo.upstash.io/pipeline"},
        {"turso", "https://demo-org.turso.io/v2/pipeline"},
    } {
        result := engine.Dispatch(context.Background(), Message{Version: 1, Op: "http", Provider: tc.provider, Method: "GET", URL: tc.url})
        if result.OK {
            t.Errorf("missing tenant / DB secret unexpectedly accepted: %+v", tc)
        }
    }
}
