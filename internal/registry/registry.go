package registry

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Version struct {
	Version string `json:"version"`
	Path    string `json:"path"`
	Yanked  bool   `json:"yanked"`
}

type Package struct {
	Namespace   string    `json:"namespace"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Versions    []Version `json:"versions"`
}

type Index struct {
	Protocol      string    `json:"protocol"`
	PackageFormat string    `json:"packageFormat"`
	Packages      []Package `json:"packages"`
}

type Handler struct {
	root  string
	index Index
}

func New(root string) (*Handler, error) {
	raw, err := os.ReadFile(filepath.Join(root, "registry", "index.json"))
	if err != nil {
		return nil, err
	}
	var index Index
	if err := json.Unmarshal(raw, &index); err != nil {
		return nil, err
	}
	if index.Protocol != "v1" {
		return nil, errors.New("unsupported registry protocol")
	}
	return &Handler{root: root, index: index}, nil
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	switch {
	case r.Method == http.MethodGet && r.URL.Path == "/health":
		writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "protocol": h.index.Protocol})
	case r.Method == http.MethodGet && r.URL.Path == "/v1/index":
		writeJSON(w, http.StatusOK, h.index)
	case r.Method == http.MethodGet && r.URL.Path == "/v1/search":
		h.search(w, r)
	case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/v1/packages/"):
		h.packageRoute(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (h *Handler) search(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	var result []Package
	for _, pkg := range h.index.Packages {
		hay := strings.ToLower(pkg.Namespace + "/" + pkg.Name + " " + pkg.Description)
		if q == "" || strings.Contains(hay, q) {
			result = append(result, pkg)
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"packages": result, "count": len(result)})
}

func (h *Handler) packageRoute(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(strings.TrimPrefix(r.URL.Path, "/v1/packages/"), "/"), "/")
	if len(parts) < 2 || len(parts) > 4 {
		http.NotFound(w, r)
		return
	}
	pkg, ok := h.findPackage(parts[0], parts[1])
	if !ok {
		http.NotFound(w, r)
		return
	}
	if len(parts) == 2 {
		writeJSON(w, http.StatusOK, pkg)
		return
	}
	version, ok := findVersion(pkg, parts[2])
	if !ok {
		http.NotFound(w, r)
		return
	}
	archive, digest, err := h.archive(version)
	if err != nil {
		http.Error(w, "package archive unavailable", http.StatusInternalServerError)
		return
	}
	if len(parts) == 3 {
		writeJSON(w, http.StatusOK, map[string]any{
			"namespace": pkg.Namespace,
			"name": pkg.Name,
			"version": version.Version,
			"yanked": version.Yanked,
			"packageFormat": h.index.PackageFormat,
			"checksum": "sha256:" + digest,
			"download": "/v1/packages/" + pkg.Namespace + "/" + pkg.Name + "/" + version.Version + "/download",
		})
		return
	}
	if parts[3] != "download" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/vnd.noqeri.package+gzip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+pkg.Name+"-"+version.Version+`.nqpkg"`)
	w.Header().Set("Digest", "sha-256="+digest)
	w.Header().Set("ETag", `"`+digest+`"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(archive)
}

func (h *Handler) findPackage(namespace, name string) (Package, bool) {
	for _, pkg := range h.index.Packages {
		if pkg.Namespace == namespace && pkg.Name == name {
			return pkg, true
		}
	}
	return Package{}, false
}

func findVersion(pkg Package, version string) (Version, bool) {
	for _, v := range pkg.Versions {
		if v.Version == version {
			return v, true
		}
	}
	return Version{}, false
}

func (h *Handler) archive(v Version) ([]byte, string, error) {
	root := filepath.Join(h.root, filepath.FromSlash(v.Path))
	var paths []string
	if err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		paths = append(paths, filepath.ToSlash(rel))
		return nil
	}); err != nil {
		return nil, "", err
	}
	sort.Strings(paths)

	var out bytes.Buffer
	gz, _ := gzip.NewWriterLevel(&out, gzip.BestCompression)
	gz.Name = ""
	gz.Comment = ""
	gz.ModTime = time.Unix(0, 0)
	tw := tar.NewWriter(gz)
	zero := time.Unix(0, 0)

	for _, rel := range paths {
		data, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
		if err != nil {
			return nil, "", err
		}
		header := &tar.Header{Name: rel, Mode: 0o644, Size: int64(len(data)), ModTime: zero, AccessTime: zero, ChangeTime: zero, Uid: 0, Gid: 0, Uname: "", Gname: "", Format: tar.FormatUSTAR}
		if err := tw.WriteHeader(header); err != nil {
			return nil, "", err
		}
		if _, err := io.Copy(tw, bytes.NewReader(data)); err != nil {
			return nil, "", err
		}
	}
	if err := tw.Close(); err != nil {
		return nil, "", err
	}
	if err := gz.Close(); err != nil {
		return nil, "", err
	}
	sum := sha256.Sum256(out.Bytes())
	return out.Bytes(), hex.EncodeToString(sum[:]), nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
