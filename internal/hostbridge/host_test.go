package hostbridge

import (
	"bytes"
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"strings"
	"sync"
	"testing"
)

type fakeTransport func(*http.Request) (*http.Response, error)

func (f fakeTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func envValues(values map[string]string) EnvFunc                          { return func(s string) string { return values[s] } }
func TestHTTPAuthAndProviderPolicies(t *testing.T) {
	var seen int
	client := &http.Client{Transport: fakeTransport(func(r *http.Request) (*http.Response, error) {
		seen++
		if r.Header.Get("Authorization") != "Bearer test-secure-key" {
			t.Errorf("missing credential")
		}
		if r.URL.Host != "api.github.com" {
			t.Errorf("incorrect routing")
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"ok":true}`)), Header: make(http.Header)}, nil
	})}
	host := NewEngine()
	host.HTTP.Client = client
	host.Env = envValues(map[string]string{"NOQERI_GITHUB_TOKEN": "test-secure-key"})
	r := host.Dispatch(context.Background(), Message{Version: 1, Op: "http", ID: "t1", Provider: "github", Method: "GET", URL: "https://api.github.com/repos/demo/proj"})
	if !r.OK || r.Status != 200 || r.Body != `{"ok":true}` {
		t.Fatal(r)
	}
	if host.LastHTTPStatus() != 200 {
		t.Fatal("last status not updated")
	}
	for _, tc := range []struct{ url, method, provider string }{
		{"https://127.0.0.1/secret", "GET", "github"},
		{"http://api.github.com/repos", "GET", "github"},
		{"https://api.github.com.evil.com/", "GET", "github"},
		{"https://api.github.com:444/", "GET", "github"},
		{"https://user@api.github.com/", "GET", "github"},
		{"https://api.github.com/repos", "TRACE", "github"},
		{"https://api.github.com/repos", "GET", "unknown"},
	} {
		out := host.Dispatch(context.Background(), Message{Version: 1, Op: "http", Provider: tc.provider, Method: tc.method, URL: tc.url})
		if out.OK {
			t.Errorf("unsafe request accepted: %+v", tc)
		}
	}
	if seen != 1 {
		t.Fatalf("unexpected external requests: %d", seen)
	}
}
func TestStripeAndSupabaseHeaders(t *testing.T) {
	e := NewEngine()
	e.Env = envValues(map[string]string{
		"NOQERI_STRIPE_TOKEN": "sk_test_fake_value", "NOQERI_STRIPE_IDEMPOTENCY_KEY": "req-1234",
		"NOQERI_SUPABASE_TOKEN": "sb_secret_testing", "NOQERI_SUPABASE_JWT": "valid_jwt_fixture_value",
	})
	e.HTTP.Client = &http.Client{Transport: fakeTransport(func(r *http.Request) (*http.Response, error) {
		switch r.URL.Host {
		case "api.stripe.com":
			if r.Header.Get("Content-Type") != "application/x-www-form-urlencoded" || r.Header.Get("Idempotency-Key") != "req-1234" {
				t.Errorf("stripe headers incorrect")
			}
		case "test.supabase.co":
			if r.Header.Get("apikey") != "sb_secret_testing" || r.Header.Get("Authorization") != "Bearer valid_jwt_fixture_value" {
				t.Errorf("supabase headers incorrect")
			}
		default:
			t.Errorf("unknown host: %s", r.URL.Host)
		}
		return &http.Response{StatusCode: 201, Body: io.NopCloser(strings.NewReader("{}")), Header: make(http.Header)}, nil
	})}
	for _, m := range []Message{{Version: 1, Op: "http", Provider: "stripe", URL: "https://api.stripe.com/v1/payment_intents", Method: "POST", Body: "amount=100&currency=usd"}, {Version: 1, Op: "http", Provider: "supabase", URL: "https://test.supabase.co/rest/v1/items", Method: "GET"}} {
		r := e.Dispatch(context.Background(), m)
		if !r.OK || r.Status != 201 {
			t.Fatal(r)
		}
	}
}
func TestHTTPBodyCap(t *testing.T) {
	e := NewEngine()
	e.Env = envValues(map[string]string{"NOQERI_GITHUB_TOKEN": "long-long-key"})
	e.HTTP.Client = &http.Client{Transport: fakeTransport(func(*http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(strings.Repeat("x", (1<<20)+30))), Header: make(http.Header)}, nil
	})}
	r := e.Dispatch(context.Background(), Message{Version: 1, Op: "http", Provider: "github", Method: "GET", URL: "https://api.github.com/repos/test/test"})
	if r.OK || r.Error != "upstream_body_too_large" {
		t.Fatal(r)
	}
}
func TestProtocolRedactsAndRejects(t *testing.T) {
	e := NewEngine()
	e.Env = envValues(map[string]string{})
	input := "{\"v\":1,\"id\":\"a\",\"op\":\"ping\"}\n{\"v\":1,\"op\":\"http\",\"url\":\"https://example.com\",\"method\":\"GET\",\"provider\":\"github\"}\n"
	var out bytes.Buffer
	if err := e.Serve(context.Background(), strings.NewReader(input), &out); err != nil {
		t.Fatal(err)
	}
	var entries []Result
	for _, line := range strings.Split(strings.TrimSpace(out.String()), "\n") {
		var v Result
		if err := json.Unmarshal([]byte(line), &v); err != nil {
			t.Fatal(err)
		}
		entries = append(entries, v)
	}
	if len(entries) != 2 || !entries[0].OK || entries[0].Body != "pong" || entries[1].OK {
		t.Fatal(entries)
	}
}

type mockDriver struct{}

func (mockDriver) Open(_ string) (driver.Conn, error) { return mockConn{}, nil }

type mockConn struct{}

func (mockConn) Prepare(query string) (driver.Stmt, error)                    { return mockStmt{}, nil }
func (mockConn) Close() error                                                 { return nil }
func (mockConn) Begin() (driver.Tx, error)                                    { return mockTx{}, nil }
func (mockConn) Ping(context.Context) error                                   { return nil }
func (mockConn) BeginTx(context.Context, driver.TxOptions) (driver.Tx, error) { return mockTx{}, nil }
func (mockConn) ExecContext(_ context.Context, q string, args []driver.NamedValue) (driver.Result, error) {
	if len(args) > 0 && args[0].Value != int64(42) {
		return nil, errors.New("wrong arg")
	}
	return driver.RowsAffected(1), nil
}
func (mockConn) QueryContext(_ context.Context, q string, args []driver.NamedValue) (driver.Rows, error) {
	return &mockRows{}, nil
}

type mockStmt struct{}

func (mockStmt) Close() error                               { return nil }
func (mockStmt) NumInput() int                              { return -1 }
func (mockStmt) Exec([]driver.Value) (driver.Result, error) { return driver.RowsAffected(1), nil }
func (mockStmt) Query([]driver.Value) (driver.Rows, error)  { return &mockRows{}, nil }

type mockRows struct{ sent bool }

func (mockRows) Columns() []string { return []string{"answer", "message"} }
func (mockRows) Close() error      { return nil }
func (m *mockRows) Next(dest []driver.Value) error {
	if m.sent {
		return io.EOF
	}
	m.sent = true
	dest[0] = int64(42)
	dest[1] = []byte("hello")
	return nil
}

type mockTx struct{}

func (mockTx) Commit() error   { return nil }
func (mockTx) Rollback() error { return nil }

var mockOnce sync.Once

func TestDatabaseParameterizedCalls(t *testing.T) {
	mockOnce.Do(func() { sql.Register("mock-sqlite-test", mockDriver{}) })
	// driver registration uses an explicit name; a private handle tests all transactional methods.
	db, err := sql.Open("mock-sqlite-test", "ignored")
	if err != nil {
		t.Fatal(err)
	}
	h := NewDBHost()
	h.handles[1] = &handle{db: db}
	params := []json.RawMessage{json.RawMessage(`42`)}
	n, err := h.Exec(context.Background(), 1, "INSERT INTO items VALUES (?)", params)
	if err != nil || n != 1 {
		t.Fatal(n, err)
	}
	cols, rows, err := h.Query(context.Background(), 1, "SELECT answer,message FROM items", nil)
	if err != nil || len(cols) != 2 || len(rows) != 1 || rows[0][1] != "hello" {
		t.Fatal(cols, rows, err)
	}
	if err := h.Begin(context.Background(), 1); err != nil {
		t.Fatal(err)
	}
	if err := h.Begin(context.Background(), 1); err == nil {
		t.Fatal("nested transaction accepted")
	}
	if err := h.Rollback(1); err != nil {
		t.Fatal(err)
	}
	if _, err := h.Exec(context.Background(), 1, "SELECT 1", []json.RawMessage{json.RawMessage(`{"sql":"malicious"}`)}); err == nil {
		t.Fatal("nested object accepted")
	}
	if err := h.Close(1); err != nil {
		t.Fatal(err)
	}
}
func TestPrivateAddressFilter(t *testing.T) {
	for _, s := range []string{"127.0.0.1", "10.2.3.4", "192.168.3.5", "169.254.169.254", "100.64.0.1", "::1", "fc00::1", "2001:db8::1"} {
		if publicIP(net.ParseIP(s)) {
			t.Fatal("private IP accepted: " + s)
		}
	}
	if !publicIP(net.ParseIP("8.8.8.8")) {
		t.Fatal("public IP rejected")
	}
}

func TestProviderAuthVariants(t *testing.T) {
	e := NewEngine()
	e.Env = envValues(map[string]string{
		"NOQERI_PLANETSCALE_TOKEN":    "secret-planet-value",
		"NOQERI_PLANETSCALE_TOKEN_ID": "id-planet-value",
		"NOQERI_FIREBASE_TOKEN":       "fake-firebase-api-key",
	})
	e.HTTP.Client = &http.Client{Transport: fakeTransport(func(r *http.Request) (*http.Response, error) {
		if r.URL.Host == "api.planetscale.com" {
			if r.Header.Get("Authorization") != "id-planet-value:secret-planet-value" {
				t.Errorf("incorrect PlanetScale service token")
			}
		} else if r.URL.Host == "identitytoolkit.googleapis.com" {
			if r.URL.Query().Get("key") != "fake-firebase-api-key" {
				t.Errorf("missing Firebase auth API key")
			}
			if r.Header.Get("Authorization") != "" {
				t.Errorf("firebase Auth should not use bearer")
			}
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader("{}")), Header: make(http.Header)}, nil
	})}
	for _, req := range []Message{
		{Version: 1, Op: "http", Provider: "planetscale", Method: "GET", URL: "https://api.planetscale.com/v1/organizations"},
		{Version: 1, Op: "http", Provider: "firebase", Method: "POST", URL: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword", Body: `{"email":"person@example.com"}`},
	} {
		response := e.Dispatch(context.Background(), req)
		if !response.OK {
			t.Fatal(response)
		}
	}
}
