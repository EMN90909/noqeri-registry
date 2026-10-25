package main

import(
"encoding/json"
"fmt"
"os"
"path/filepath"
"sort"
"strings"
)
type Spec struct{Entry,Module,Purpose,Limitations,Source,Regression,Example string}
func fatal(e error){if e!=nil{fmt.Fprintln(os.Stderr,e);os.Exit(1)}}
func write(path,body string){fatal(os.MkdirAll(filepath.Dir(path),0755));a,e:=os.ReadFile(path);if e==nil&&string(a)==body{return};fatal(os.WriteFile(path,[]byte(body),0644))}
func names(src,needle string)[]string{
 seen:=map[string]bool{}
 for _,line:=range strings.Split(src,"\n"){
  row:=strings.TrimSpace(line)
  if strings.HasPrefix(row,needle){
   rest:=strings.TrimPrefix(row,needle)
   parts:=strings.FieldsFunc(rest,func(r rune)bool{return r=='('||r=='<'||r==' '})
   if len(parts)>0{seen[parts[0]]=true}
  }
 }
 out:=[]string{}
 for n:=range seen{out=append(out,n)}
 sort.Strings(out)
 return out
}
func main(){
 data,err:=os.ReadFile("release-011-batch2.json");fatal(err)
 var specs map[string]Spec;fatal(json.Unmarshal(data,&specs))
 license,err:=os.ReadFile("LICENSE");fatal(err)
 indexBytes,err:=os.ReadFile("registry/index.json");fatal(err)
 var catalog map[string]any;fatal(json.Unmarshal(indexBytes,&catalog))
 pkgs,ok:=catalog["packages"].([]any);if !ok{fatal(fmt.Errorf("invalid index"))}
 expected:="csv db dom env fetch firebase fs github glob hex html http-client http-server"
 allowed:=map[string]bool{};for _,n:=range strings.Fields(expected){allowed[n]=true}
 if len(specs)!=13{fatal(fmt.Errorf("expected 13 specs; got %d",len(specs)))}
 sorted:=[]string{};for n:=range specs{sorted=append(sorted,n)};sort.Strings(sorted)
 for _,n:=range sorted{
  v:=specs[n]
  if !allowed[n]||v.Entry==""||v.Purpose==""||v.Source==""||v.Regression==""||v.Example==""||v.Module==""{fatal(fmt.Errorf("incomplete %s",n))}
  if !strings.HasPrefix(v.Source,"// SPDX-License-Identifier: MIT")||!strings.Contains(v.Source,"module "+v.Module){fatal(fmt.Errorf("invalid MIT source %s",n))}
  entry:="src/"+v.Entry+".noqeri";dir:="packages/noqeri/"+n+"/0.1.1/"
  manifest:=fmt.Sprintf("package {\n    name: %q\n    version: \"0.1.1\"\n    edition: \"2026\"\n    entry: %q\n    profile: \"library\"\n    target: \"portable\"\n    license: \"MIT\"\n}\n","noqeri/"+n,entry)
  write(dir+"package.noqeri",manifest);write(dir+"LICENSE",string(license));write(dir+entry,v.Source)
  test:="// SPDX-License-Identifier: MIT\nimport "+fmt.Sprintf("%q","../"+entry)+"\nfunction main(): int {\n"+strings.TrimSpace(v.Regression)+"\n    return 0\n}\nprint(main())\n"
  write(dir+"tests/regression.noqeri",test)
  write(dir+"examples/basic.noqeri","// SPDX-License-Identifier: MIT\nimport "+fmt.Sprintf("%q","../"+entry)+"\n"+strings.TrimSpace(v.Example)+"\n")
  exports:=names(v.Source,"export function ");externs:=names(v.Source,"extern function ")
  api:=fmt.Sprintf("# noqeri/%s 0.1.1 API Reference\n\n## %d exported functions\n\n",n,len(exports))
  for _,fn:=range exports{api+="- "+fn+"\n"}
  api+=fmt.Sprintf("\n## %d external host bindings\n\n",len(externs))
  for _,fn:=range externs{api+="- "+fn+"\n"}
  api+="\n## Scope\n\n"+v.Purpose+"\n\n## Limitations\n\n"+v.Limitations+"\n"
  write(dir+"API_REFERENCE.md",api)
  text:=fmt.Sprintf("# noqeri/%s 0.1.1\n\n**International preview | MIT | Noqeri Edition 2026**\n\n%s\n\nThe new implementation exports %d functions. Refer to API_REFERENCE.md for full details and host bindings.\n\n## Run\n\nnoqeri check tests/regression.noqeri\n\nnoqeri run tests/regression.noqeri\n\nThe pure-logic tests must print 0. Hosted functions require external integration tests.\n\n## Limitations\n\n%s\n\nOld GPL-3.0-only releases retain their original notices. This new source is MIT.\n",n,v.Purpose,len(exports),v.Limitations)
  write(dir+"README.md",text)
  write(dir+"RELEASE_NOTES.md",fmt.Sprintf("# 0.1.1 release: noqeri/%s\n\nExpanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.\n\n%s\n",n,v.Limitations))
  found:=false
  for _,item:=range pkgs {
   obj:=item.(map[string]any);if obj["name"]!=n||obj["namespace"]!="noqeri"{continue}
   found=true;vers:=obj["versions"].([]any);has:=false;for _,it:=range vers{if it.(map[string]any)["version"]=="0.1.1"{has=true}}
   if !has{obj["versions"]=append(vers,map[string]any{"version":"0.1.1","path":"packages/noqeri/"+n+"/0.1.1","yanked":false,"experimental":true,"quality":"experimental","evidence":"test-contract"})}
  }
  if !found{fatal(fmt.Errorf("missing catalog package %s",n))}
 }
 out,err:=json.MarshalIndent(catalog,"","  ");fatal(err)
 write("registry/index.json",string(out)+"\n")
 fmt.Printf("Generated %d independent MIT Noqeri releases\n",len(sorted))
}
