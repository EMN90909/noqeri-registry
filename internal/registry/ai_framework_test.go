package registry
import (
  "archive/tar"
  "bytes"
  "compress/gzip"
  "crypto/sha256"
  "fmt"
  "io"
  "path/filepath"
  "testing"
)
// The AI framework is a deterministic source package, not a binary or
// implicit native tool loader. Check its published artifact and integrity.
func TestAIFrameworkIndexedRelease(t *testing.T) {
  catalog,err:=Open(filepath.Join("..",".."))
  if err!=nil {t.Fatal(err)}
  p,ok:=catalog.PackageByID["noqeri/ai-framework"]
  if !ok || len(p.Versions)!=1 {t.Fatal("AI framework package missing or ambiguous")}
  r:=p.Versions[0]
  if r.Version!="0.1.4" || r.Yanked || r.Quality!="experimental" ||
     r.Evidence!="test-contract" {t.Fatalf("invalid maturity metadata: %+v",r)}
  archive,err:=BuildArchive(filepath.Join(catalog.Root,filepath.FromSlash(r.Path)))
  if err!=nil {t.Fatal(err)}
  if archive.Entry!="src/framework.noqeri" {t.Fatal("incorrect canonical entry")}
  if fmt.Sprintf("%x",sha256.Sum256(archive.Bytes))!=archive.Digest {t.Fatal("bad digest")}
  zip,err:=gzip.NewReader(bytes.NewReader(archive.Bytes))
  if err!=nil {t.Fatal(err)}
  defer zip.Close()
  reader:=tar.NewReader(zip)
  required:=map[string]bool{"src/framework.noqeri":false,"tests/regression.noqeri":false,
                            "package.noqeri":false,"README.md":false}
  for {
    header,err:=reader.Next()
    if err==io.EOF {break}
    if err!=nil {t.Fatal(err)}
    if _,ok:=required[header.Name];ok {required[header.Name]=true}
  }
  for name,found:=range required {if !found {t.Fatalf("missing %s",name)}}
}
