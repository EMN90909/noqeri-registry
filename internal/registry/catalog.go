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

var identityPattern = regexp.MustCompile("^[a-z0-9][a-z0-9-]*$")
var versionPattern = regexp.MustCompile("^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\\+[0-9A-Za-z.-]+)?$")

type Release struct {
    Version string `json:"version"`
    Archive string `json:"archive"`
	ArchiveIntegrity string `json:"archiveIntegrity"`
    Entry string `json:"entry"`
    Dependencies map[string]string `json:"dependencies,omitempty"`
    Downloads int64 `json:"downloads"`
    Yanked bool `json:"yanked"`
}
type Package struct {
    Namespace string `json:"namespace"`
    Name string `json:"name"`
    Description string `json:"description"`
    Repository string `json:"repository,omitempty"`
    Versions []Release `json:"versions"`
}
type Index struct {
    Protocol string `json:"protocol"`
    PackageFormat string `json:"packageFormat"`
    ArchiveExtension string `json:"archiveExtension"`
    GeneratedAt string `json:"generatedAt"`
    Packages []Package `json:"packages"`
}
type Catalog struct { Root string; Index Index; PackageByID map[string]Package }

func Open(root string) (*Catalog, error) {
    abs, err := filepath.Abs(root); if err != nil { return nil, err }
    raw, err := os.ReadFile(filepath.Join(abs, "registry", "index.json")); if err != nil { return nil, err }
    if len(raw) > 4<<20 { return nil, errors.New("index exceeds 4 MiB") }
    var index Index
    if err := json.Unmarshal(raw, &index); err != nil { return nil, err }
    if index.Protocol != "v1" || index.PackageFormat != "ndl-1" || index.ArchiveExtension != ".ndl" { return nil, errors.New("unsupported registry protocol or archive format") }
    byID := make(map[string]Package, len(index.Packages))
    for i := range index.Packages {
        p := &index.Packages[i]; id := p.Namespace + "/" + p.Name
        if !identityPattern.MatchString(p.Namespace) || !identityPattern.MatchString(p.Name) { return nil, fmt.Errorf("invalid package identity %q", id) }
        if _, ok := byID[id]; ok { return nil, fmt.Errorf("duplicate package %s", id) }
        seen := map[string]bool{}
        for _, r := range p.Versions {
            if !versionPattern.MatchString(r.Version) || seen[r.Version] { return nil, fmt.Errorf("invalid release %s@%s", id, r.Version) }
            seen[r.Version] = true
            if !strings.HasPrefix(r.ArchiveIntegrity, "sha256:") || len(r.ArchiveIntegrity) != 71 { return nil, fmt.Errorf("invalid release metadata %s@%s", id, r.Version) }
            if !safeArchivePath(r.Archive) || !strings.HasSuffix(r.Archive, ".ndl") || !safeArchivePath(r.Entry) || !strings.HasSuffix(r.Entry, ".noqeri") { return nil, fmt.Errorf("invalid path metadata %s@%s", id, r.Version) }
        }
        sort.SliceStable(p.Versions, func(a,b int) bool { return compareSemver(p.Versions[a].Version,p.Versions[b].Version)>0 })
        byID[id] = *p
    }
    sort.Slice(index.Packages, func(a,b int) bool { return index.Packages[a].Namespace+"/"+index.Packages[a].Name < index.Packages[b].Namespace+"/"+index.Packages[b].Name })
    return &Catalog{Root:abs, Index:index, PackageByID:byID}, nil
}
func safeArchivePath(value string) bool {
    if value=="" || filepath.IsAbs(value) || strings.ContainsAny(value, "\\\x00") { return false }
    for _, p := range strings.Split(filepath.ToSlash(value), "/") { if p=="" || p=="." || p==".." { return false } }
    return true
}
func compareSemver(a,b string) int {
    split:=func(v string)[]string{return strings.SplitN(strings.SplitN(v,"+",2)[0],"-",2)}
    aa,bb:=split(a),split(b); av,bv:=strings.Split(aa[0],"."),strings.Split(bb[0],".")
    for i:=0;i<3;i++ { ai,_:=strconv.ParseUint(av[i],10,64); bi,_:=strconv.ParseUint(bv[i],10,64); if ai>bi{return 1};if ai<bi{return -1} }
    if len(aa)==1&&len(bb)==2{return 1};if len(aa)==2&&len(bb)==1{return -1}
    if len(aa)==2&&len(bb)==2 { ap,bp:=strings.Split(aa[1],"."),strings.Split(bb[1],"."); for i:=0;i<len(ap)&&i<len(bp);i++ { if ap[i]==bp[i]{continue}; an,ae:=strconv.ParseUint(ap[i],10,64); bn,be:=strconv.ParseUint(bp[i],10,64); if ae==nil&&be==nil {if an>bn{return 1};return -1};if ae==nil{return -1};if be==nil{return 1};if ap[i]>bp[i]{return 1};return -1 };if len(ap)>len(bp){return 1};if len(ap)<len(bp){return -1} }
    return 0
}

