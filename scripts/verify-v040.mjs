#!/usr/bin/env node
import {readFile,stat} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const catalog=JSON.parse(await readFile(join(root,'registry/index.json'),'utf8'))
const errors=[]
for(const p of catalog.packages){
 const key=p.namespace+'/'+p.name
 const active=p.versions.filter(v=>!v.yanked)
 if(active.length!==1 || active[0]?.version!=='0.4.0')errors.push(key+': active release is not 0.4.0')
 const folder=join(root,'packages',p.namespace,p.name,'0.4.0')
 const manifestFile=join(folder,'package.nqr')
 let manifest=''
 try{manifest=await readFile(manifestFile,'utf8')}catch{errors.push(key+': missing manifest');continue}
 if(!manifest.includes('name: "'+key+'"')||!manifest.includes('version: "0.4.0"'))errors.push(key+': manifest identity mismatch')
 if(!manifest.includes('license: "GPL-3.0-only"'))errors.push(key+': license mismatch')
 const match=/\bentry:\s*"([^"]+)"/.exec(manifest)
 if(!match||match[1].startsWith('/')||match[1].split('/').includes('..')){errors.push(key+': unsafe or absent source entry');continue}
 try{const s=await stat(join(folder,match[1]));if(!s.isFile()||!s.size)errors.push(key+': empty entry')}catch{errors.push(key+': entry not found')}
 for(const rel of ['RELEASE_NOTES.md','tests/release_smoke.nqr']){
  try{const s=await stat(join(folder,rel));if(!s.isFile()||!s.size)errors.push(key+': missing '+rel)}catch{errors.push(key+': missing '+rel)}
 }
}
console.log(JSON.stringify({packages:catalog.packages.length,activeVersion:'0.4.0',errors},null,2))
if(errors.length || catalog.packages.length!==54)process.exitCode=1
