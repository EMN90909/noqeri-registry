package main

import (
 "errors"
 "flag"
 "fmt"
 "os"
 "path/filepath"
 "regexp"
 "strings"

 "github.com/EMN90909/noqeri-registry/internal/registry"
)

var legacy=regexp.MustCompile(`\.(nqr|nqo)([^a-zA-Z0-9_]|$)`)
var relativeImport=regexp.MustCompile(`\bimport\s+"([^"]+)"`)

func main(){
 root:=flag.String("root",".","repository root")
 flag.Parse()
 if flag.NArg()!=1 {fmt.Fprintln(os.Stderr,"usage: registryctl [-root dir] verify|audit");os.Exit(2)}
 catalog,err:=registry.Open(*root)
 if err!=nil{fatal(err)}
 switch flag.Arg(0){
 case "verify":
  checked:=0
  for _,p:=range catalog.Index.Packages{
   for _,release:=range p.Versions{
    if release.Yanked {continue}
    root:=filepath.Join(catalog.Root,filepath.FromSlash(release.Path))
    if err:=checkRelease(root);err!=nil{fatal(fmt.Errorf("%s/%s@%s: %w",p.Namespace,p.Name,release.Version,err))}
    checked++
   }
  }
  fmt.Printf("Verified %d non-yanked package releases (Go+Noqeri)\n",checked)
 case "audit":
  n:=0;for _,p:=range catalog.Index.Packages{n+=len(p.Versions)}
  fmt.Printf("packages=%d versions=%d language=Go+Noqeri storage=source-index (no NoeSQL)\n",len(catalog.Index.Packages),n)
 default: fatal(errors.New("unknown command"))
 }
}
func checkRelease(root string)error{
 manifest,err:=os.ReadFile(filepath.Join(root,"package.noqeri"))
 if err!=nil{return err}
 _=manifest
 return filepath.Walk(root,func(path string,info os.FileInfo,err error)error{
  if err!=nil{return err}
  if info.Mode()&os.ModeSymlink!=0{return errors.New("symlinks forbidden")}
  if info.IsDir(){return nil}
  if !info.Mode().IsRegular(){return errors.New("unsupported package file")}
  if strings.HasSuffix(path,".nqr")||strings.HasSuffix(path,".nqo"){return fmt.Errorf("legacy extension: %s",path)}
  if strings.HasSuffix(path,".noqeri")||strings.HasSuffix(path,".md"){
   data,err:=os.ReadFile(path);if err!=nil{return err}
   if legacy.Match(data){return fmt.Errorf("legacy extension reference: %s",path)}
   if strings.HasSuffix(path,".noqeri"){
    for _,match:=range relativeImport.FindAllSubmatch(data,-1){
     ref:=string(match[1]);if strings.HasPrefix(ref,"."){
      if strings.Contains(ref,"\\") {return fmt.Errorf("unsafe import %q",ref)}
      dst:=filepath.Clean(filepath.Join(filepath.Dir(path),ref))
      base:=filepath.Dir(root)
      rel,err:=filepath.Rel(base,dst)
      if err!=nil||strings.HasPrefix(rel,".."){return fmt.Errorf("import outside package namespace %q",ref)}
      if _,err:=os.Stat(dst);err!=nil{return fmt.Errorf("missing import %q",ref)}
     }
    }
   }
  }
  return nil
 })
}
func fatal(err error){fmt.Fprintln(os.Stderr,err);os.Exit(1)}
