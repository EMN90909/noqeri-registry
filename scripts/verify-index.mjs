#!/usr/bin/env node
// Offline registry catalog contract checks; does not claim actual package execution.
import { readFile } from 'node:fs/promises'
const path=process.argv[2] || new URL('../registry/index.json',import.meta.url)
const failures=[]
try{
 const data=JSON.parse(await readFile(path,'utf8'))
 if(data.protocol!=='v1'||data.packageFormat!=='nqpkg-1')failures.push('unexpected protocol/package format')
 if(!Array.isArray(data.packages))failures.push('packages must be an array')
 const keys=new Set()
 for(const pkg of data.packages || []) {
  const key=pkg.namespace+'/'+pkg.name
  if(!/^[a-z0-9_-]+\/[a-z0-9_-]+$/.test(key))failures.push('bad coordinate: '+key)
  if(keys.has(key))failures.push('duplicate coordinate: '+key)
  keys.add(key)
  if(!Array.isArray(pkg.versions)||!pkg.versions.length)failures.push('no releases: '+key)
  const versions=new Set()
  for(const item of pkg.versions||[]) {
   if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(item.version||''))failures.push('bad version: '+key)
   if(versions.has(item.version))failures.push('duplicate version: '+key+'@'+item.version)
   versions.add(item.version)
   if(typeof item.yanked!=='boolean')failures.push('missing yanked flag: '+key+'@'+item.version)
   if(typeof item.path!=='string'||item.path!==['packages',pkg.namespace,pkg.name,item.version].join('/'))failures.push('unexpected path: '+key+'@'+item.version)
  }
 }
 console.log(JSON.stringify({packages:keys.size,failures},null,2))
}catch(err){failures.push(err.message);console.error(err.message)}
if(failures.length)process.exitCode=1
