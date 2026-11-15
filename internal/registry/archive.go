package registry

import ("crypto/sha256";"encoding/hex";"errors";"os";"path/filepath";"strings";"sync")

type Artifact struct { Bytes []byte; Digest string }
type ArtifactCache struct { mu sync.Mutex; items map[string]Artifact }

func (c *ArtifactCache) Get(root string, release Release) (Artifact,error) {
    c.mu.Lock(); defer c.mu.Unlock()
    if c.items==nil {c.items=make(map[string]Artifact)}
    if item,ok:=c.items[release.Archive];ok{return item,nil}
    if !safeArchivePath(release.Archive){return Artifact{},errors.New("unsafe archive path")}
    file:=filepath.Join(root,filepath.FromSlash(release.Archive));data,err:=os.ReadFile(file);if err!=nil{return Artifact{},err}
    if len(data)==0||len(data)>8<<20{return Artifact{},errors.New("archive size is outside bounds")}
    sum:=sha256.Sum256(data);digest:=hex.EncodeToString(sum[:]);if release.ArchiveIntegrity!="sha256:"+digest{return Artifact{},errors.New("archive integrity mismatch")}
    if !strings.HasSuffix(file,".ndl"){return Artifact{},errors.New("archive extension mismatch")}
    item:=Artifact{Bytes:data,Digest:digest};c.items[release.Archive]=item;return item,nil
}

