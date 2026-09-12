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

func TestHealthSearchAndNewPackageFamilies(t *testing.T) {
	h, err := New(repoRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	paths := []string{
		"/health",
		"/v1/index",
		"/v1/search?q=core",
		"/v1/search?q=http",
		"/v1/packages/noqeri/core",
		"/v1/packages/noqeri/json",
		"/v1/packages/noqeri/dom",
		"/v1/packages/noqeri/db",
	}
	for _, path := range paths {
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
	v, ok := findVersion(pkg, "1.0.0")
	if !ok {
		t.Fatal("core 1.0.0 version missing")
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

func TestPublishedWebPackageCanDownload(t *testing.T) {
	h, err := New(repoRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/v1/packages/noqeri/json/1.0.0/download", nil)
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("json package download: expected 200, got %d", rec.Code)
	}
	if rec.Body.Len() == 0 {
		t.Fatal("json package archive was empty")
	}
	if got := rec.Header().Get("Content-Type"); got != "application/gzip" && got != "application/octet-stream" {
		t.Fatalf("unexpected archive content type %q", got)
	}
}
