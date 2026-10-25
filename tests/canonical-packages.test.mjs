import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,readdir,stat} from 'node:fs/promises'
import {join,resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {makeArchive} from '../runtime/archive.mjs'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
async function walk(dir){let out=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
test('all 55 registry packages have exactly one active canonical 0.1.0 source release',async()=>{
 const index=JSON.parse(await readFile(join(root,'registry/index.json'),'utf8'))
 assert.equal(index.packages.length,55)
 const seen=new Set()
 for(const pkg of index.packages){
   const key=pkg.namespace+'/'+pkg.name
   assert.equal(seen.has(key),false,'duplicate '+key);seen.add(key)
   const active=pkg.versions.filter(v=>!v.yanked)
   assert.equal(active.length,1,key+' active release count')
   assert.equal(active[0].version,'0.1.0',key+' active release version')
   const dir=join(root,active[0].path)
   const manifest=await readFile(join(dir,'package.noqeri'),'utf8')
   assert.match(manifest,/\\bversion:\\s*"0\\.1\\.0"/,key)
   assert.ok(manifest.includes('name: "'+key+'"')||manifest.includes('namespace: "'+pkg.namespace+'"'),key+' manifest identity')
   const match=/\\bentry:\\s*"([^"]+)"/.exec(manifest)
   assert.ok(match,key+' source entry')
   assert.ok(match[1].endsWith('.noqeri'),key+' canonical entry extension')
   assert.ok((await stat(join(dir,match[1]))).isFile(),key+' entry exists')
   const files=await walk(dir)
   assert.ok(files.every(f=>!(/\\.(nqr|nqo)$/.test(f))),key+' forbidden filenames')
   for(const f of files.filter(f=>f.endsWith('.noqeri'))){
     const text=await readFile(f,'utf8')
     assert.doesNotMatch(text,/\\.(?:nqr|nqo)\\b/,f+' legacy import reference')
   }
   const archive=await makeArchive(dir)
   assert.equal(archive.legacy,false,key)
   assert.ok(archive.integrity.startsWith('sha256:'),key)
 }
})
