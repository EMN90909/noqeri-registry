package hostbridge

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// This test runs against an actual SQLite database when compiled with -tags dbdrivers.
// It never touches a developer's existing database file.
func TestSQLiteDatabaseRoundTrip(t *testing.T) {
	if !registered("sqlite") {
		t.Skip("build with -tags dbdrivers to use real SQLite")
	}
	file := filepath.Join(t.TempDir(), "integration.sqlite")
	h := NewDBHost()
	env := envValues(map[string]string{"NOQERI_SQLITE_PATH": file})
	handle, err := h.Open(context.Background(), "sqlite", env)
	if err != nil {
		t.Fatal(err)
	}
	defer h.Close(handle)
	if _, err = h.Exec(context.Background(), handle, "CREATE TABLE inventory(id INTEGER PRIMARY KEY, label TEXT NOT NULL)", nil); err != nil {
		t.Fatal(err)
	}
	args := []json.RawMessage{json.RawMessage(`7`), json.RawMessage(`"package-✓"`)}
	if n, err := h.Exec(context.Background(), handle, "INSERT INTO inventory(id,label) VALUES (?,?)", args); err != nil || n != 1 {
		t.Fatal(err, n)
	}
	cols, rows, err := h.Query(context.Background(), handle, "SELECT id,label FROM inventory WHERE id = ?", []json.RawMessage{json.RawMessage(`7`)})
	if err != nil || len(cols) != 2 || len(rows) != 1 || rows[0][1] != "package-✓" {
		t.Fatalf("got %#v %#v: %v", cols, rows, err)
	}
	if err := h.Begin(context.Background(), handle); err != nil {
		t.Fatal(err)
	}
	if _, err = h.Exec(context.Background(), handle, "INSERT INTO inventory(id,label) VALUES (?,?)", []json.RawMessage{json.RawMessage(`8`), json.RawMessage(`"rollback"`)}); err != nil {
		t.Fatal(err)
	}
	if err := h.Rollback(handle); err != nil {
		t.Fatal(err)
	}
	_, rows, err = h.Query(context.Background(), handle, "SELECT id FROM inventory WHERE id = ?", []json.RawMessage{json.RawMessage(`8`)})
	if err != nil || len(rows) != 0 {
		t.Fatalf("rollback failed: %#v: %v", rows, err)
	}
}

// Live-provider tests are opt-in only. Credentials MUST be CI secrets and the
// target is a documented read-only endpoint. No mutation or payment is performed.
func TestLiveHTTPSReadOnly(t *testing.T) {
	if os.Getenv("NOQERI_RUN_LIVE_TESTS") != "1" {
		t.Skip("set NOQERI_RUN_LIVE_TESTS=1 and scoped secrets to test a real API")
	}
	provider, url := os.Getenv("NOQERI_LIVE_PROVIDER"), os.Getenv("NOQERI_LIVE_READONLY_URL")
	if provider == "" || url == "" {
		t.Skip("set NOQERI_LIVE_PROVIDER and NOQERI_LIVE_READONLY_URL")
	}
	engine := NewEngine()
	out := engine.Dispatch(context.Background(), Message{Version: 1, ID: "live", Op: "http", Provider: provider, Method: "GET", URL: url})
	if !out.OK || out.Status < 200 || out.Status >= 500 {
		t.Fatalf("live read-only request failed: code %d reason %s", out.Status, out.Error)
	}
}
func TestLivePostgresReadOnly(t *testing.T) {
	if os.Getenv("NOQERI_RUN_LIVE_TESTS") != "1" || os.Getenv("NOQERI_POSTGRES_DSN") == "" {
		t.Skip("credential-gated PostgreSQL integration")
	}
	h := NewDBHost()
	handle, err := h.Open(context.Background(), "postgres", os.Getenv)
	if err != nil {
		t.Fatal(err)
	}
	defer h.Close(handle)
	cols, rows, err := h.Query(context.Background(), handle, "SELECT $1::integer AS answer", []json.RawMessage{json.RawMessage(`42`)})
	if err != nil || len(cols) != 1 || len(rows) != 1 {
		t.Fatalf("Postgres SELECT test failed: %v", err)
	}
}
