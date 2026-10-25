package main

import (
 "encoding/json"
 "flag"
 "fmt"
 "os"
 "path/filepath"
 "sort"
 "strings"
)
type Upgrade struct { About string; Source string; Test string }
const marker="// REGISTRY_CAPABILITY_UPGRADE_V2"
const readmeMarker="REGISTRY_CAPABILITY_DOC_V2"

func fail(err error){fmt.Fprintln(os.Stderr,err);os.Exit(1)}
func write(path,body string,check bool)*bool{
 data,err:=os.ReadFile(path)
 if err==nil&&string(data)==body{return nil}
 if check{fail(fmt.Errorf("out of date: %s",path))}
 if err:=os.MkdirAll(filepath.Dir(path),0755);err!=nil{fail(err)}
 if err:=os.WriteFile(path,[]byte(body),0644);err!=nil{fail(err)}
 yes:=true;return &yes
}
func exportNames(dir string)([]string,[]string,error){
 names:=map[string]bool{};externs:=map[string]bool{}
 err:=filepath.WalkDir(dir,func(path string,e os.DirEntry,err error)error{
  if err!=nil{return err}
  if e.IsDir()||!strings.HasSuffix(path,".noqeri"){return nil}
  raw,err:=os.ReadFile(path);if err!=nil{return err}
  for _,line:=range strings.Split(string(raw),"\n"){
   trimmed:=strings.TrimSpace(line)
   for _,rule:=range []struct{prefix string;dest map[string]bool}{{"export function ",names},{"extern function ",externs}}{
    if strings.HasPrefix(trimmed,rule.prefix){
     rest:=strings.TrimPrefix(trimmed,rule.prefix)
     name:=strings.FieldsFunc(rest,func(r rune)bool{return r=='('||r=='<'||r==' '})
     if len(name)>0{rule.dest[name[0]]=true}
    }
   }
  }
  return nil
 })
 f:=make([]string,0,len(names));for n:=range names{f=append(f,n)}
 x:=make([]string,0,len(externs));for n:=range externs{x=append(x,n)}
 sort.Strings(f);sort.Strings(x)
 return f,x,err
}
func main(){
 root:=flag.String("root",".","repository root")
 check:=flag.Bool("check",false,"verify generated materials without writing")
 flag.Parse()
 b,err:=os.ReadFile(filepath.Join(*root,"package-upgrades.json"))
 if err!=nil{fail(err)}
 var rules map[string]Upgrade
 if err:=json.Unmarshal(b,&rules);err!=nil{fail(err)}
 top:=filepath.Join(*root,"packages","noqeri")
 pkgs,err:=os.ReadDir(top);if err!=nil{fail(err)}
 releases:=0;edited:=0;deepened:=0
 for _,p:=range pkgs{
  if !p.IsDir(){continue}
  versions,err:=os.ReadDir(filepath.Join(top,p.Name()));if err!=nil{fail(err)}
  for _,v:=range versions{
   if !v.IsDir(){continue}
   dir:=filepath.Join(top,p.Name(),v.Name())
   manifest,err:=os.ReadFile(filepath.Join(dir,"package.noqeri"))
   if os.IsNotExist(err){continue};if err!=nil{fail(err)}
   raw:=string(manifest)
   start:=strings.Index(raw,"entry:")
   if start<0{fail(fmt.Errorf("no manifest entry: %s",dir))}
   val:=strings.TrimSpace(raw[start+6:])
   q:=strings.Index(val,"\"");if q<0{fail(fmt.Errorf("invalid manifest entry: %s",dir))}
   val=val[q+1:]
   end:=strings.Index(val,"\"");if end<0{fail(fmt.Errorf("invalid manifest entry: %s",dir))}
   entry:=val[:end]
   if filepath.IsAbs(entry)||strings.Contains(entry,"..")||!strings.HasSuffix(entry,".noqeri"){fail(fmt.Errorf("unsafe entry: %s",entry))}
   src:=filepath.Join(dir,filepath.FromSlash(entry))
   content,err:=os.ReadFile(src);if err!=nil{fail(err)}
   rule,found:=rules[p.Name()]
   updated:=string(content)
   if found&&rule.Source!=""&&!strings.Contains(updated,marker){
    updated+="\n"+marker+"\n"+strings.TrimSpace(rule.Source)+"\n"
    deepened++
   }
   if write(src,updated,*check)!=nil{edited++}
   if found&&rule.Test!=""{
    contract:="// SPDX-License-Identifier: GPL-3.0-only\n// Executable positive and negative capability contract.\nimport "+fmt.Sprintf("%q","../"+filepath.ToSlash(entry))+"\nfunction main(): int {\n"+rule.Test+"\n    return 0\n}\nprint(main())\n"
    if write(filepath.Join(dir,"tests","capability_regression.noqeri"),contract,*check)!=nil{edited++}
    usage:="// SPDX-License-Identifier: GPL-3.0-only\n// Working capability example with visible positive and negative cases.\nimport "+fmt.Sprintf("%q","../"+filepath.ToSlash(entry))+"\nfunction main(): int {\n"+rule.Test+"\n    return 0\n}\nprint(main())\n"
    if write(filepath.Join(dir,"examples","capability_walkthrough.noqeri"),usage,*check)!=nil{edited++}
   }
   funcs,ext,err:=exportNames(filepath.Join(dir,"src"));if err!=nil{fail(err)}
   var doc strings.Builder
   fmt.Fprintf(&doc,"# %s %s API inventory\n\n",p.Name(),v.Name())
   doc.WriteString("Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**\n\n")
   fmt.Fprintf(&doc,"- Entry: %s\n- Exported functions: %d\n- Host externs: %d\n\n",entry,len(funcs),len(ext))
   doc.WriteString("## Exported API\n\n")
   for _,n:=range funcs{fmt.Fprintf(&doc,"- %s\n",n)}
   if len(funcs)==0{doc.WriteString("No public functions in this release.\n")}
   if len(ext)>0{
    doc.WriteString("\n## External host bindings required\n\n")
    for _,n:=range ext{fmt.Fprintf(&doc,"- %s\n",n)}
    doc.WriteString("\nThese declarations need real host implementations; compiling does not provide network, database or cryptographic services.\n")
   }
   if found{
    fmt.Fprintf(&doc,"\n## Expanded functionality\n\n%s\n\nRun tests/capability_regression.noqeri using a compatible Noqeri compiler.\n",rule.About)
   }else{
    doc.WriteString("\n## Capability status\n\nNo new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.\n")
   }
   if write(filepath.Join(dir,"API_REFERENCE.md"),doc.String(),*check)!=nil{edited++}
   readme:=filepath.Join(dir,"README.md")
   original,err:=os.ReadFile(readme)
   if err!=nil&&!os.IsNotExist(err){fail(err)}
   text:=string(original)
   if !strings.Contains(text,readmeMarker){
    if text!=""&&!strings.HasSuffix(text,"\n"){text+="\n"}
    text+="\n<!-- "+readmeMarker+" -->\n\n## API inventory and evidence\n\nRead [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.\n"
   }
   if write(readme,text,*check)!=nil{edited++}
   releases++
  }
 }
 fmt.Printf("Audited %d releases; enhanced %d source files; changed %d files.\n",releases,deepened,edited)
}
