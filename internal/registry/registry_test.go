package registry

import (
 "archive/tar"
 "bytes"
 "compress/gzip"
 "crypto/sha256"
 "encoding/json"
 "fmt"
 "io"
 "net/http"
 "net/http/httptest"
 "os"
 "path/filepath"
 "strings"
 "testing"
)

func fixture(t *testing.T)*Catalog{
 t.Helper();root:=t.TempDir()
 for _,version:=range []string{"0.1.0","0.2.0"}{
  dir:=filepath.Join(root,"packages","noqeri","demo",version)
  if err:=os.MkdirAll(filepath.Join(dir,"src"),0755);err!=nil{t.Fatal(err)}
  if err:=os.WriteFile(filepath.Join(dir,"package.noqeri"),[]byte(fmt.Sprintf("package { name: \"noqeri/demo\" version: \"%s\" entry: \"src/main.noqeri\" }\n",version)),0644);err!=nil{t.Fatal(err)}
  if err:=os.WriteFile(filepath.Join(dir,"src","main.noqeri"),[]byte("module demo\n"),0644);err!=nil{t.Fatal(err)}
 }
 if err:=os.MkdirAll(filepath.Join(root,"registry"),0755);err!=nil{t.Fatal(err)}
 if err:=os.MkdirAll(filepath.Join(root,"advisories"),0755);err!=nil{t.Fatal(err)}
 index:=`{"protocol":"v1","packageFormat":"nqpkg-1","packages":[{"namespace":"noqeri","name":"demo","description":"Demo","versions":[{"version":"0.1.0","path":"packages/noqeri/demo/0.1.0","yanked":false},{"version":"0.2.0","path":"packages/noqeri/demo/0.2.0","yanked":true}]}]}`
 if err:=os.WriteFile(filepath.Join(root,"registry","index.json"),[]byte(index),0644);err!=nil{t.Fatal(err)}
 if err:=os.WriteFile(filepath.Join(root,"advisories","index.json"),[]byte(`{"schema":1,"advisories":[]}`),0644);err!=nil{t.Fatal(err)}
 c,err:=Open(root);if err!=nil{t.Fatal(err)};return c
}
func TestArchiveDeterministic(t *testing.T){
 c:=fixture(t);dir:=filepath.Join(c.Root,"packages","noqeri","demo","0.1.0")
 a,err:=BuildArchive(dir);if err!=nil{t.Fatal(err)}
 b,err:=BuildArchive(dir);if err!=nil{t.Fatal(err)}
 if !bytes.Equal(a.Bytes,b.Bytes){t.Fatal("archive is not deterministic")}
 if fmt.Sprintf("%x",sha256.Sum256(a.Bytes))!=a.Digest{t.Fatal("SHA mismatch")}
 gz,err:=gzip.NewReader(bytes.NewReader(a.Bytes));if err!=nil{t.Fatal(err)}
 defer gz.Close()
 tarReader:=tar.NewReader(gz);found:=false
 for{hdr,err:=tarReader.Next();if err==io.EOF{break};if err!=nil{t.Fatal(err)};if hdr.Name=="src/main.noqeri"{found=true}}
 if !found{t.Fatal("source missing from archive")}
}
func TestArchiveRejectsUnsafeInput(t *testing.T){
 for _,bad:=range []string{"../a","/etc/passwd","a//b","x/./y","a/../b","a\\b"}{if SafeRelative(bad){t.Fatalf("accepted unsafe %q",bad)}}
 c:=fixture(t);dir:=filepath.Join(c.Root,"packages","noqeri","demo","0.1.0")
 if err:=os.Symlink("/etc/passwd",filepath.Join(dir,"evil"));err!=nil{t.Skip(err)}
 if _,err:=BuildArchive(dir);err==nil{t.Fatal("accepted symlink")}
}
func TestHTTPContracts(t *testing.T){
 c:=fixture(t);handler:=NewHandler(c)
 do:=func(method,path string)(int,[]byte,http.Header){
  req:=httptest.NewRequest(method,path,nil);w:=httptest.NewRecorder();handler.ServeHTTP(w,req);res:=w.Result();defer res.Body.Close()
  body,_:=io.ReadAll(res.Body);return res.StatusCode,body,res.Header
 }
 for _,route:=range []string{"/health","/v1/status","/v1/index","/v1/packages","/v1/search?q=demo","/v1/advisories","/v1/packages/noqeri/demo","/v1/packages/noqeri/demo/versions"}{
  status,_,_:=do("GET",route);if status!=200{t.Errorf("%s: %d",route,status)}
 }
 status,body,_:=do("GET","/v1/packages/noqeri/demo/0.1.0");if status!=200{t.Fatal(status)}
 var meta map[string]any;if err:=json.Unmarshal(body,&meta);err!=nil{t.Fatal(err)}
 if !strings.HasPrefix(meta["archiveIntegrity"].(string),"sha256:"){t.Fatal("missing integrity")}
 status,body,headers:=do("GET","/v1/packages/noqeri/demo/0.1.0/download")
 if status!=200||headers.Get("X-Archive-SHA256")!=fmt.Sprintf("%x",sha256.Sum256(body)){t.Fatal("archive digest mismatch")}
 status,_,_=do("GET","/v1/packages/noqeri/demo/0.2.0/download");if status!=404{t.Fatal("yanked artifact exposed")}
 status,_,_=do("GET","/v1/packages/noqeri/demo/notaversion");if status!=400{t.Fatal("invalid version accepted")}
 status,_,_=do("GET","/v1/search?limit=1000");if status!=400{t.Fatal("invalid pagination accepted")}
 status,_,_=do("POST","/v1/index");if status!=405{t.Fatal("write method accepted")}
 status,body,_=do("HEAD","/v1/index");if status!=200||len(body)!=0{t.Fatal("HEAD returned a body")}
}
func TestOpenRejectsTraversal(t *testing.T){
 c:=fixture(t)
 content,_:=os.ReadFile(filepath.Join(c.Root,"registry","index.json"))
 content=bytes.Replace(content,[]byte("packages/noqeri/demo/0.1.0"),[]byte("packages/../../etc"),1)
 os.WriteFile(filepath.Join(c.Root,"registry","index.json"),content,0644)
 if _,err:=Open(c.Root);err==nil{t.Fatal("unsafe source path accepted")}
}
