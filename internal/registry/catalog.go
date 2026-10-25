package registry

import (
 "encoding/json"
 "errors"
 "fmt"
 "os"
 "path/filepath"
 "regexp"
 "sort"
 "strconv"
 "strings"
)

var identityPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)
var versionPattern = regexp.MustCompile(`^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$`)

type Release struct {
 Version string `json:"version"`
 Path string `json:"path,omitempty"`
 Yanked bool `json:"yanked"`
 Experimental bool `json:"experimental,omitempty"`
 Quality string `json:"quality,omitempty"`
 Evidence string `json:"evidence,omitempty"`
 MigrationFrom string `json:"migrationFrom,omitempty"`
 ReplacedBy string `json:"replacedBy,omitempty"`
}
type Package struct {
 Namespace string `json:"namespace"`
 Name string `json:"name"`
 Description string `json:"description"`
 Versions []Release `json:"versions"`
}
type Index struct {
 Protocol string `json:"protocol"`
 PackageFormat string `json:"packageFormat"`
 Packages []Package `json:"packages"`
}
type Catalog struct { Root string; Index Index; PackageByID map[string]Package }

func Open(root string) (*Catalog,error) {
 abs,err:=filepath.Abs(root); if err!=nil{return nil,err}
 input,err:=os.ReadFile(filepath.Join(abs,"registry","index.json"));if err!=nil{return nil,err}
 if len(input)>4<<20 {return nil,errors.New("index exceeds 4MiB")}
 var idx Index
 if err=json.Unmarshal(input,&idx);err!=nil{return nil,err}
 if idx.Protocol!="v1" || idx.PackageFormat!="nqpkg-1" {return nil,errors.New("unsupported registry protocol/format")}
 lookup:=make(map[string]Package,len(idx.Packages))
 for i:=range idx.Packages {
  p:=&idx.Packages[i]; id:=p.Namespace+"/"+p.Name
  if !identityPattern.MatchString(p.Namespace)||!identityPattern.MatchString(p.Name){return nil,fmt.Errorf("invalid package identity: %q",id)}
  if _,exists:=lookup[id];exists{return nil,fmt.Errorf("duplicate package %s",id)}
  seen:=make(map[string]bool)
  for _,v:=range p.Versions {
   if !versionPattern.MatchString(v.Version) || seen[v.Version] {return nil,fmt.Errorf("invalid or duplicate version for %s",id)}
   seen[v.Version]=true
   expected:="packages/"+id+"/"+v.Version
   if v.Path!=expected {return nil,fmt.Errorf("unsafe or missing release path for %s@%s",id,v.Version)}
  }
  sort.SliceStable(p.Versions,func(i,j int)bool{return semverCompare(p.Versions[i].Version,p.Versions[j].Version)>0})
  lookup[id]=*p
 }
 sort.Slice(idx.Packages,func(i,j int)bool{return idx.Packages[i].Namespace+"/"+idx.Packages[i].Name < idx.Packages[j].Namespace+"/"+idx.Packages[j].Name})
 return &Catalog{Root:abs,Index:idx,PackageByID:lookup},nil
}
func semverCompare(a,b string)int{
 split:=func(x string)[]string{return strings.SplitN(strings.SplitN(x,"+",2)[0],"-",2)}
 aa,bb:=split(a),split(b)
 av,bv:=strings.Split(aa[0],"."),strings.Split(bb[0],".")
 for i:=0;i<3;i++{
  ai,ae:=strconv.ParseUint(av[i],10,64);bi,be:=strconv.ParseUint(bv[i],10,64)
  if ae==nil && be==nil{if ai>bi{return 1};if ai<bi{return -1}}else{if len(av[i])>len(bv[i]){return 1};if len(av[i])<len(bv[i]){return -1};if av[i]>bv[i]{return 1};if av[i]<bv[i]{return -1}}
 }
 if len(aa)==1&&len(bb)==2{return 1}
 if len(aa)==2&&len(bb)==1{return -1}
 if len(aa)==2&&len(bb)==2{
  ax,bx:=strings.Split(aa[1],"."),strings.Split(bb[1],".")
  for i:=0;i<len(ax)&&i<len(bx);i++ {
   if ax[i]==bx[i]{continue}
   ai,ae:=strconv.ParseUint(ax[i],10,64);bi,be:=strconv.ParseUint(bx[i],10,64)
   if ae==nil&&be==nil{if ai>bi{return 1};return -1}
   if ae==nil{return -1};if be==nil{return 1}
   if ax[i]>bx[i]{return 1};return -1
  }
  if len(ax)>len(bx){return 1};if len(ax)<len(bx){return -1}
 }
 return 0
}
