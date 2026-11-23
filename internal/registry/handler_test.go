package registry

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestCatalogAndReadOnlyRoutes(t *testing.T) {
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "registry"), 0755); err != nil {
		t.Fatal(err)
	}
	index := []byte("{\"protocol\":\"v1\",\"packageFormat\":\"ndl-1\",\"archiveExtension\":\".ndl\",\"packages\":[]}")
	if err := os.WriteFile(filepath.Join(root, "registry", "index.json"), index, 0644); err != nil {
		t.Fatal(err)
	}
	c, err := Open(root)
	if err != nil {
		t.Fatal(err)
	}
	h := NewHandler(c)
	for _, method := range []string{"GET", "HEAD"} {
		req := httptest.NewRequest(method, "/v1/status", nil)
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != 200 {
			t.Fatalf("%s: %d", method, rec.Code)
		}
	}
	req := httptest.NewRequest("POST", "/v1/status", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 405 {
		t.Fatalf("write route: %d", rec.Code)
	}
}

func TestBundledDistributionDownloadsAndDigests(t *testing.T) {
	root := filepath.Clean(filepath.Join("..", ".."))
	c, err := Open(root)
	if err != nil {
		t.Fatalf("open registry root %s: %v", root, err)
	}
	if len(c.Index.Packages) != 13 {
		t.Fatalf("expected 13 bundled packages, got %d", len(c.Index.Packages))
	}
	h := NewHandler(c)

	req := httptest.NewRequest("GET", "/v1/index", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("/v1/index status %d", rec.Code)
	}

	var parsed struct {
		Packages []struct {
			Namespace string `json:"namespace"`
			Name      string `json:"name"`
			Versions  []struct {
				Version          string            `json:"version"`
				ArchiveIntegrity string            `json:"archiveIntegrity"`
				Download         string            `json:"download"`
				Dependencies     map[string]string `json:"dependencies"`
			} `json:"versions"`
		} `json:"packages"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &parsed); err != nil {
		t.Fatalf("decode /v1/index: %v", err)
	}

	seenWebDeps := false
	for _, pkg := range parsed.Packages {
		if len(pkg.Versions) == 0 {
			t.Fatalf("package %s/%s has no versions", pkg.Namespace, pkg.Name)
		}
		v := pkg.Versions[0]
		if pkg.Name == "web" {
			if v.Dependencies["noqeri/http"] != "1.0.0" || v.Dependencies["noqeri/json"] != "1.0.0" || v.Dependencies["noqeri/crypto"] != "1.0.0" {
				t.Fatalf("unexpected noqeri/web dependencies: %+v", v.Dependencies)
			}
			seenWebDeps = true
		}
		dlReq := httptest.NewRequest("GET", v.Download, nil)
		dlRec := httptest.NewRecorder()
		h.ServeHTTP(dlRec, dlReq)
		if dlRec.Code != 200 {
			t.Fatalf("download %s: %d", v.Download, dlRec.Code)
		}
		sum := sha256.Sum256(dlRec.Body.Bytes())
		hexSum := hex.EncodeToString(sum[:])
		if dlRec.Header().Get("X-Archive-SHA256") != hexSum {
			t.Fatalf("X-Archive-SHA256 mismatch on %s", v.Download)
		}
		if "sha256:"+hexSum != v.ArchiveIntegrity {
			t.Fatalf("integrity mismatch on %s: got sha256:%s expected %s", v.Download, hexSum, v.ArchiveIntegrity)
		}
	}
	if !seenWebDeps {
		t.Fatal("missing noqeri/web in bundled index")
	}
}
