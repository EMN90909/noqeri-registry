package registry

import ("encoding/json";"fmt";"net/http";"os";"path/filepath";"strconv";"strings")

type Handler struct { catalog *Catalog; archives ArtifactCache }
type headWriter struct { http.ResponseWriter }
func (w headWriter) Write(b []byte)(int,error){return len(b),nil}
func NewHandler(c *Catalog) http.Handler{return &Handler{catalog:c}}
func (h *Handler) reply(w http.ResponseWriter,status int,body any){data,err:=json.Marshal(body);if err!=nil{http.Error(w,"internal_error",500);return};w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Content-Length",strconv.Itoa(len(data)));w.WriteHeader(status);_,_=w.Write(data)}
func (h *Handler) error(w http.ResponseWriter,status int,message string){h.reply(w,status,map[string]string{"error":message})}
func (h *Handler) releaseView(p Package) map[string]any {versions:=[]map[string]any{};for _,r:=range p.Versions{versions=append(versions,map[string]any{"version":r.Version,"archive":r.Archive,"archiveIntegrity":r.ArchiveIntegrity,"entry":r.Entry,"dependencies":r.Dependencies,"downloads":r.Downloads,"yanked":r.Yanked,"download":"/v1/packages/"+p.Namespace+"/"+p.Name+"/"+r.Version+"/download"})};return map[string]any{"namespace":p.Namespace,"name":p.Name,"description":p.Description,"repository":p.Repository,"versions":versions}}
func (h *Handler) all()[]map[string]any{out:=make([]map[string]any,0,len(h.catalog.Index.Packages));for _,p:=range h.catalog.Index.Packages{out=append(out,h.releaseView(p))};return out}
func (h *Handler) bytes(w http.ResponseWriter,contentType string,data []byte){w.Header().Set("Content-Type",contentType);w.Header().Set("Content-Length",strconv.Itoa(len(data)));w.WriteHeader(200);_,_=w.Write(data)}
func (h *Handler) ServeHTTP(w http.ResponseWriter,r *http.Request){
 w.Header().Set("X-Content-Type-Options","nosniff");w.Header().Set("Referrer-Policy","no-referrer");w.Header().Set("Access-Control-Allow-Origin","*");w.Header().Set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'")
 if r.Method!="GET"&&r.Method!="HEAD"{h.error(w,405,"method_not_allowed");return};if r.Method=="HEAD"{w=headWriter{w}}
 path:=r.URL.Path;if len(path)>512||len(r.URL.RawQuery)>2048||strings.ContainsAny(r.URL.EscapedPath(),"%\\")||strings.Contains(path,"..")||strings.Contains(path,"//"){h.error(w,400,"invalid_url");return}
 switch path{
 case "/","/index.html":h.serveFile(w,filepath.Join(h.catalog.Root,"web","index.html"),"text/html; charset=utf-8");return
 case "/health":h.reply(w,200,map[string]any{"status":"ok","protocol":"v1","archiveExtension":".ndl"});return
 case "/v1/status":h.reply(w,200,map[string]any{"status":"ready","protocol":"v1","packageFormat":"ndl-1","publishingEnabled":false,"anonymousRead":true});return
 case "/v1/index":h.reply(w,200,map[string]any{"protocol":"v1","packageFormat":"ndl-1","archiveExtension":".ndl","packages":h.all()});return
 case "/v1/packages":h.reply(w,200,map[string]any{"packages":h.all()});return
 case "/v1/search":query:=strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")));if len(query)>128{h.error(w,400,"search_too_long");return};results:=[]map[string]any{};for _,p:=range h.catalog.Index.Packages{if strings.Contains(strings.ToLower(p.Namespace+"/"+p.Name+" "+p.Description),query){results=append(results,h.releaseView(p))}};h.reply(w,200,map[string]any{"query":query,"total":len(results),"packages":results});return
 case "/v1/advisories":h.serveFile(w,filepath.Join(h.catalog.Root,"registry","advisories.json"),"application/json; charset=utf-8");return
 case "/v1/releases":h.serveFile(w,filepath.Join(h.catalog.Root,"registry","releases.json"),"application/json; charset=utf-8");return}
 parts:=strings.Split(strings.TrimPrefix(path,"/"),"/");if len(parts)<4||len(parts)>6||parts[0]!="v1"||parts[1]!="packages"{h.error(w,404,"not_found");return};id:=parts[2]+"/"+parts[3];p,ok:=h.catalog.PackageByID[id];if !ok{h.error(w,404,"package_not_found");return}
 if len(parts)==4{h.reply(w,200,h.releaseView(p));return};if len(parts)==5&&parts[4]=="versions"{h.reply(w,200,map[string]any{"namespace":p.Namespace,"name":p.Name,"versions":h.releaseView(p)["versions"]});return}
 version:=parts[4];var release *Release;for i:=range p.Versions{if p.Versions[i].Version==version{release=&p.Versions[i];break}};if release==nil{h.error(w,404,"release_not_found");return};if len(parts)==5{h.reply(w,200,map[string]any{"namespace":p.Namespace,"name":p.Name,"version":version,"archiveIntegrity":release.ArchiveIntegrity,"entry":release.Entry,"dependencies":release.Dependencies,"downloads":release.Downloads,"yanked":release.Yanked});return};if release.Yanked||parts[5]!="download"{h.error(w,404,"release_not_found");return}
 artifact,err:=h.archives.Get(h.catalog.Root,*release);if err!=nil{h.error(w,503,"artifact_unavailable");return};w.Header().Set("X-Archive-SHA256",artifact.Digest);w.Header().Set("ETag","\""+artifact.Digest+"\"");w.Header().Set("Content-Disposition",fmt.Sprintf("attachment; filename=%q",p.Namespace+"-"+p.Name+"-"+version+".ndl"));h.bytes(w,"application/vnd.noqeri.nodule+gzip",artifact.Bytes)
}
func (h *Handler) serveFile(w http.ResponseWriter,filename,contentType string){info,err:=os.Stat(filename);if err!=nil||!info.Mode().IsRegular()||info.Size()>4<<20{h.error(w,503,"catalog_asset_unavailable");return};data,err:=os.ReadFile(filename);if err!=nil{h.error(w,503,"catalog_asset_unavailable");return};h.bytes(w,contentType,data)}

