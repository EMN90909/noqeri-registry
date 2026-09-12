package registry

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func repoRoot(t *testing.T) string {
	t.Helper()
	root, err := filepath.Abs("../..")
	if err != nil {
		t.Fatal(err)
	}
	return root
}

func TestHealthAndSearch(t *testing.T) {
	h, err := New(repoRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	for _, path := range []string{"/health", "/v1/index", "/v1/search?q=core", "/v1/packages/noqeri/core"} {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, path, nil)
		h.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("%s: expected 200, got %d", path, rec.Code)
		}
	}
}

func TestArchiveIsDeterministic(t *testing.T) {
	h, err := New(repoRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	pkg, ok := h.findPackage("noqeri", "core")
	if !ok {
		t.Fatal("core package missing")
	}
	v, ok := findVersion(pkg, "1.5.0")
	if !ok {
		t.Fatal("core version missing")
	}
	a, da, err := h.archive(v)
	if err != nil {
		t.Fatal(err)
	}
	b, db, err := h.archive(v)
	if err != nil {
		t.Fatal(err)
	}
	if da != db || !bytes.Equal(a, b) {
		t.Fatal("deterministic package archive changed between identical builds")
	}
}
