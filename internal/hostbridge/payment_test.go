package hostbridge

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestStripeWebhookVerification(t *testing.T) {
	timestamp := int64(1700000000)
	body := `{"type":"payment_intent.succeeded","id":"evt_test"}`
	secret := "whsec_very_secure_secret"
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(strconv.FormatInt(timestamp, 10) + "." + body))
	header := "t=" + strconv.FormatInt(timestamp, 10) + ",v1=" + hex.EncodeToString(mac.Sum(nil))
	now := time.Unix(timestamp+50, 0)
	if err := VerifyStripeSignature(body, header, secret, now); err != nil {
		t.Fatal(err)
	}
	for _, test := range []struct {
		body, header string
		now          time.Time
	}{
		{body + " ", header, now},
		{body, header, time.Unix(timestamp+301, 0)},
		{body, "t=abc,v1=deadbeef", now},
		{body, "t=1700000000,v1=" + hex.EncodeToString(make([]byte, 32)), now},
	} {
		if VerifyStripeSignature(test.body, test.header, secret, test.now) == nil {
			t.Fatal("forged or expired webhook accepted")
		}
	}
	e := NewEngine()
	e.Env = envValues(map[string]string{"NOQERI_STRIPE_WEBHOOK_SECRET": secret})
	// Protocol dispatch uses real wall time; it intentionally rejects stale fixtures.
	out := e.Dispatch(context.Background(), Message{Version: 1, Op: "stripe_verify_webhook", Body: body, Signature: header})
	if out.OK {
		t.Fatal("old webhook should not be accepted")
	}
}
func TestInvokeNoqeriExternMapping(t *testing.T) {
	e := NewEngine()
	e.Env = envValues(map[string]string{"NOQERI_GITHUB_TOKEN": "unit-test-secret"})
	called := 0
	e.HTTP.Client = &http.Client{Transport: fakeTransport(func(r *http.Request) (*http.Response, error) {
		called++
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"ok":true}`)), Header: make(http.Header)}, nil
	})}
	out := e.Dispatch(context.Background(), Message{Version: 1, Op: "invoke", Symbol: "providerHttpJson", Arguments: []string{"GET", "https://api.github.com/rate_limit", "bearer", "ignored-source-secret", "Accept", "application/json", ""}})
	if !out.OK || out.Status != 200 || called != 1 {
		t.Fatal(out)
	}
	status := e.Dispatch(context.Background(), Message{Version: 1, Op: "invoke", Symbol: "providerHttpStatus"})
	if !status.OK || status.Body != "200" {
		t.Fatal(status)
	}
	bad := e.Dispatch(context.Background(), Message{Version: 1, Op: "invoke", Symbol: "providerHttpJson", Arguments: []string{"GET", "https://not-github.com/", "bearer", "x", "", "", ""}})
	if bad.OK {
		t.Fatal("unknown host allowed")
	}
}
