package registry

import ("net/http";"net/http/httptest";"os";"path/filepath";"testing")
func TestCatalogAndReadOnlyRoutes(t *testing.T){root:=t.TempDir();if err:=os.MkdirAll(filepath.Join(root,"registry"),0755);err!=nil{t.Fatal(err)};index:=[]byte("{\"protocol\":\"v1\",\"packageFormat\":\"ndl-1\",\"archiveExtension\":\".ndl\",\"packages\":[]}");if err:=os.WriteFile(filepath.Join(root,"registry","index.json"),index,0644);err!=nil{t.Fatal(err)};c,err:=Open(root);if err!=nil{t.Fatal(err)};h:=NewHandler(c);for _,method:=range []string{"GET","HEAD"}{req:=httptest.NewRequest(method,"/v1/status",nil);rec:=httptest.NewRecorder();h.ServeHTTP(rec,req);if rec.Code!=200{t.Fatalf("%s: %d",method,rec.Code)}};req:=httptest.NewRequest("POST","/v1/status",nil);rec:=httptest.NewRecorder();h.ServeHTTP(rec,req);if rec.Code!=405{t.Fatalf("write route: %d",rec.Code)}}

