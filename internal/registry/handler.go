package registry

import (
 "crypto/sha256"
 "encoding/json"
 "fmt"
 "net/http"
 "os"
 "path/filepath"
 "strconv"
 "strings"
)

type Handler struct{ catalog *Catalog; archives ArtifactCache }
type headOnlyWriter struct{ http.ResponseWriter }
func (w headOnlyWriter)Write(b []byte)(int,error){return len(b),nil}
func NewHandler(c *Catalog)http.Handler{return &Handler{catalog:c}}
func (h *Handler) reply(w http.ResponseWriter,code int,body any){
 w.Header().Set("Content-Type","application/json; charset=utf-8")
 out,err:=json.Marshal(body);if err!=nil{http.Error(w,"internal_error",500);return}
 w.Header().Set("Content-Length",strconv.Itoa(len(out)))
 w.WriteHeader(code);_,_=w.Write(out)
}
func (h *Handler) problem(w http.ResponseWriter,code int,err string){h.reply(w,code,map[string]string{"error":err})}
func (h *Handler) decorated(p Package)map[string]any{
 releases:=make([]map[string]any,0,len(p.Versions))
 for _,r:=range p.Versions{
  data:=map[string]any{"version":r.Version,"yanked":r.Yanked,"downloads":0,"legacy":false,"dependencies":map[string]string{}}
  a,err:=h.archives.Get(h.catalog.Root,r)
  if err==nil{
   data["archiveIntegrity"]="sha256:"+a.Digest;data["entry"]=a.Entry;data["dependencies"]=a.Dependencies
  } else {
   data["archiveUnavailable"]=true
  }
  releases=append(releases,data)
 }
 return map[string]any{"namespace":p.Namespace,"name":p.Name,"description":p.Description,"versions":releases}
}
func (h *Handler) allPackages()[]map[string]any{
 result:=make([]map[string]any,0,len(h.catalog.Index.Packages))
 for _,p:=range h.catalog.Index.Packages{result=append(result,h.decorated(p))}
 return result
}
func (h *Handler) bytes(w http.ResponseWriter,contentType string,b []byte){
 w.Header().Set("Content-Type",contentType)
 w.Header().Set("Content-Length",strconv.Itoa(len(b)))
 w.WriteHeader(200);_,_=w.Write(b)
}
func (h *Handler) ServeHTTP(w http.ResponseWriter,r *http.Request){
 w.Header().Set("X-Content-Type-Options","nosniff")
 w.Header().Set("Content-Security-Policy","default-src 'none'")
 w.Header().Set("Access-Control-Allow-Origin","*")
 w.Header().Set("Cache-Control","no-store")
 if r.Method!="GET"&&r.Method!="HEAD"{h.problem(w,405,"method_not_allowed");return}
 if r.Method=="HEAD"{w=headOnlyWriter{w}}
 if len(r.URL.Path)>512||len(r.URL.RawQuery)>2048{h.problem(w,414,"uri_too_long");return}
 // Canonical, undecoded route components only: reject alternate path encodings.
 path:=r.URL.Path
 if strings.ContainsAny(r.URL.EscapedPath(),"%\\")||strings.Contains(path,"//")||strings.Contains(path,".."){h.problem(w,400,"invalid_url");return}
 switch path{
 case "/health":
  h.reply(w,200,map[string]any{"status":"ok","storage":"source-index","nativeQualified":false})
  return
 case "/v1/status":
  h.reply(w,200,map[string]any{"status":"experimental","protocol":"v1","storage":"source-index","publishingEnabled":false,"noesqlEnabled":false})
  return
 case "/v1/index":
  h.reply(w,200,map[string]any{"protocol":"v1","packageFormat":"nqpkg-1","packages":h.allPackages()});return
 case "/v1/packages":
  h.reply(w,200,map[string]any{"packages":h.allPackages()});return
 case "/v1/search":
  q:=r.URL.Query().Get("q")
  if len(q)>128{h.problem(w,400,"search_too_long");return}
  offset,ok:=nonnegative(r.URL.Query().Get("offset"),0,99999999)
  if !ok{h.problem(w,400,"invalid_pagination");return}
  limit,ok:=nonnegative(r.URL.Query().Get("limit"),50,100)
  if !ok||limit<1{h.problem(w,400,"invalid_pagination");return}
  var results []map[string]any
  lower:=strings.ToLower(strings.TrimSpace(q))
  for _,p:=range h.catalog.Index.Packages{
   if strings.Contains(strings.ToLower(p.Namespace+"/"+p.Name+" "+p.Description),lower){results=append(results,h.decorated(p))}
  }
  count:=len(results)
  if offset>=count{results=[]map[string]any{}}else{end:=offset+limit;if end>count{end=count};results=results[offset:end]}
  h.reply(w,200,map[string]any{"packages":results,"total":count,"offset":offset,"limit":limit});return
 case "/v1/advisories":
  raw,err:=os.ReadFile(filepath.Join(h.catalog.Root,"advisories","index.json"))
  if err!=nil{h.problem(w,503,"advisories_unavailable");return}
  var doc struct{Advisories []json.RawMessage `json:"advisories"`}
  if json.Unmarshal(raw,&doc)!=nil{h.problem(w,503,"advisories_invalid");return}
  if doc.Advisories==nil{doc.Advisories=[]json.RawMessage{}}
  // Static advisory catalog has no unsupported withdraw/write transport.
  h.reply(w,200,map[string]any{"schema":1,"advisories":doc.Advisories});return
 case "/downloads","/downloads/":
  h.serveStatic(w,filepath.Join(h.catalog.Root,"downloads","index.html"),"text/html; charset=utf-8");return
 case "/v1/releases":
  h.serveStatic(w,filepath.Join(h.catalog.Root,"downloads","releases.json"),"application/json; charset=utf-8");return
 }
 parts:=strings.Split(strings.TrimPrefix(path,"/"),"/")
 if len(parts)<4||len(parts)>6||parts[0]!="v1"||parts[1]!="packages"{h.problem(w,404,"not_found");return}
 ns,name:=parts[2],parts[3]
 if !identityPattern.MatchString(ns)||!identityPattern.MatchString(name){h.problem(w,400,"invalid_package_identity");return}
 p,exists:=h.catalog.PackageByID[ns+"/"+name]
 if !exists{h.problem(w,404,"package_not_found");return}
 if len(parts)==4{h.reply(w,200,h.decorated(p));return}
 if len(parts)==5&&parts[4]=="versions"{h.reply(w,200,map[string]any{"namespace":ns,"name":name,"versions":h.decorated(p)["versions"]});return}
 version:=parts[4]
 if !versionPattern.MatchString(version){h.problem(w,400,"invalid_version");return}
 var release *Release
 for i:=range p.Versions{if p.Versions[i].Version==version{release=&p.Versions[i];break}}
 if release==nil{h.problem(w,404,"release_not_found");return}
 a,err:=h.archives.Get(h.catalog.Root,*release)
 if err!=nil{h.problem(w,503,"artifact_unavailable");return}
 if len(parts)==5{
  h.reply(w,200,map[string]any{"namespace":ns,"name":name,"version":version,"yanked":release.Yanked,"archiveIntegrity":"sha256:"+a.Digest,"entry":a.Entry,"legacy":false,"dependencies":a.Dependencies,"downloads":0});return
 }
 if parts[5]!="download"{h.problem(w,404,"not_found");return}
 if release.Yanked{h.problem(w,404,"release_yanked");return}
 checksum:=fmt.Sprintf("%x",sha256.Sum256(a.Bytes))
 if checksum!=a.Digest{h.problem(w,503,"artifact_integrity_mismatch");return}
 w.Header().Set("X-Archive-SHA256",a.Digest)
 w.Header().Set("Content-Disposition",fmt.Sprintf("attachment; filename=%q",ns+"-"+name+"-"+version+".nqpkg"))
 h.bytes(w,"application/vnd.noqeri.package+gzip",a.Bytes)
}
func (h *Handler) serveStatic(w http.ResponseWriter,name,ctype string){
 info,err:=os.Lstat(name)
 if err!=nil||!info.Mode().IsRegular()||info.Size()>4<<20{h.problem(w,503,"static_catalog_unavailable");return}
 data,err:=os.ReadFile(name);if err!=nil{h.problem(w,503,"static_catalog_unavailable");return}
 h.bytes(w,ctype,data)
}
func nonnegative(value string,otherwise,max int)(int,bool){
 if value==""{return otherwise,true}
 if len(value)>8 {return 0,false}
 for _,c:=range value{if c<'0'||c>'9'{return 0,false}}
 n,err:=strconv.Atoi(value)
 if err!=nil||n>max{return 0,false}
 return n,true
}
