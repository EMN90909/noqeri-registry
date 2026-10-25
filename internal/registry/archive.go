package registry

import (
 "archive/tar"
 "bytes"
 "compress/gzip"
 "crypto/sha256"
 "encoding/hex"
 "errors"
 "fmt"
 "io"
 "io/fs"
 "os"
 "path"
 "path/filepath"
 "regexp"
 "sort"
 "strings"
 "sync"
 "time"
)

const maxArchiveFiles=256
const maxArchiveBytes=8<<20
var entryPattern=regexp.MustCompile(`\bentry\s*:\s*"([^"]+)"`)
var dependencyPattern=regexp.MustCompile(`(?m)^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"([a-z0-9-]+/[a-z0-9-]+@[0-9A-Za-z.+-]+)"\s*$`)

type Artifact struct{
 Bytes []byte
 Digest string
 Entry string
 Dependencies map[string]string
}

func SafeRelative(name string)bool {
 if name==""||len(name)>100||strings.ContainsAny(name,"\\\x00")||path.IsAbs(name){return false}
 for _,s:=range strings.Split(name,"/"){if s==""||s=="."||s==".."{return false}}
 return true
}
type archiveFile struct{name string; data []byte}
func BuildArchive(dir string)(Artifact,error){
 st,err:=os.Lstat(dir)
 if err!=nil{return Artifact{},err};if !st.IsDir() || st.Mode()&os.ModeSymlink!=0{return Artifact{},errors.New("archive root must be a real directory")}
 var files []archiveFile
 size:=0;directories:=0
 err=filepath.WalkDir(dir,func(name string,e fs.DirEntry,walkErr error)error{
  if walkErr!=nil{return walkErr}
  if name==dir{return nil}
  relative,err:=filepath.Rel(dir,name);if err!=nil{return err}
  rel:=filepath.ToSlash(relative)
  if !SafeRelative(rel){return fmt.Errorf("unsafe archive path %q",rel)}
  stat,err:=os.Lstat(name);if err!=nil{return err}
  if stat.Mode()&os.ModeSymlink!=0{return fmt.Errorf("links forbidden: %s",rel)}
  if stat.IsDir(){
   directories++
   if directories>256||strings.Count(rel,"/")>12{return errors.New("archive nesting limit exceeded")}
   return nil
  }
  if !stat.Mode().IsRegular(){return fmt.Errorf("non-regular file: %s",rel)}
  if len(files)>=maxArchiveFiles||stat.Size()>int64(maxArchiveBytes-size){return errors.New("package exceeds file/byte limit")}
  // Refuse hard links, and read with a strict bound.
  f,err:=os.Open(name);if err!=nil{return err};defer f.Close()
  raw,err:=io.ReadAll(io.LimitReader(f,int64(maxArchiveBytes-size+1)));if err!=nil{return err}
  if len(raw)>maxArchiveBytes-size{return errors.New("package exceeds byte limit")}
  size+=len(raw);files=append(files,archiveFile{rel,raw})
  return nil
 })
 if err!=nil{return Artifact{},err}
 sort.Slice(files,func(i,j int)bool{return files[i].name<files[j].name})
 var manifest []byte
 for _,f:=range files{if f.name=="package.noqeri"{manifest=f.data;break}}
 if manifest==nil{return Artifact{},errors.New("package.noqeri missing")}
 m:=entryPattern.FindSubmatch(manifest)
 if len(m)!=2||!SafeRelative(string(m[1]))||!strings.HasSuffix(string(m[1]),".noqeri"){return Artifact{},errors.New("invalid canonical manifest entry")}
 exists:=false
 for _,f:=range files{if f.name==string(m[1]){exists=true;break}}
 if !exists{return Artifact{},errors.New("manifest entry does not exist")}
 deps:=map[string]string{}
 for _,match:=range dependencyPattern.FindAllSubmatch(manifest,-1){deps[string(match[1])]=string(match[2])}
 var compressed bytes.Buffer
 gzipWriter,gerr:=gzip.NewWriterLevel(&compressed,gzip.BestCompression);if gerr!=nil{return Artifact{},gerr}
 gzipWriter.ModTime=time.Unix(0,0);gzipWriter.OS=255
 tw:=tar.NewWriter(gzipWriter)
 for _,f:=range files{
  header:=&tar.Header{Name:f.name,Mode:0644,Size:int64(len(f.data)),ModTime:time.Unix(0,0),Typeflag:tar.TypeReg,Format:tar.FormatUSTAR}
  if err:=tw.WriteHeader(header);err!=nil{return Artifact{},err}
  if _,err:=tw.Write(f.data);err!=nil{return Artifact{},err}
 }
 if err:=tw.Close();err!=nil{return Artifact{},err}
 if err:=gzipWriter.Close();err!=nil{return Artifact{},err}
 if compressed.Len()>maxArchiveBytes{return Artifact{},errors.New("compressed archive exceeds limit")}
 bytes:=compressed.Bytes();hash:=sha256.Sum256(bytes)
 return Artifact{Bytes:bytes,Digest:hex.EncodeToString(hash[:]),Entry:string(m[1]),Dependencies:deps},nil
}

type ArtifactCache struct{
 mu sync.Mutex
 items map[string]Artifact
}
func (cache *ArtifactCache) Get(root string,release Release)(Artifact,error){
 cache.mu.Lock();defer cache.mu.Unlock()
 if cache.items==nil{cache.items=make(map[string]Artifact)}
 if a,found:=cache.items[release.Path];found{return a,nil}
 if !strings.HasPrefix(release.Path,"packages/")||!SafeRelative(release.Path){return Artifact{},errors.New("unsafe release path")}
 a,err:=BuildArchive(filepath.Join(root,filepath.FromSlash(release.Path)))
 if err!=nil{return Artifact{},err}
 cache.items[release.Path]=a
 return a,nil
}
