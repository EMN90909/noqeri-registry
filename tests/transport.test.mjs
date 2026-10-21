import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {makeArchive,storeArchive} from '../runtime/archive.mjs'
import {createRegistryHandler} from '../runtime/server.mjs'

// Transport contract uses an injected read-only catalog fixture. It is NOT
// a substitute for the private NoeSQL .noedb end-to-end integration suite.
test('Registry v1 transport exposes deterministic metadata and SHA-verified archives',async()=>{
 const root=await mkdtemp(join(tmpdir(),'registry-transport-'))
 let server
 try {
  await mkdir(join(root,'package','src'),{recursive:true})
  await writeFile(join(root,'package','package.noqeri'),'package { entry: "src/main.noqeri" }\n')
  await writeFile(join(root,'package','src','main.noqeri'),'module demo\n')
  const archive=await makeArchive(join(root,'package'))
  const archiveRoot=join(root,'artifacts'),stored=await storeArchive(archiveRoot,archive)
  const state={tables:{
   packages:{rows:[{id:1,namespace:'noqeri',name:'demo',description:'Demo'}]},
   versions:{rows:[{id:1,package_id:1,version:'1.0.0',yanked:false,archive_integrity:archive.integrity,archive_location:stored,entry:archive.entry,legacy:false},
    {id:2,package_id:1,version:'2.0.0',yanked:true,archive_integrity:archive.integrity,archive_location:stored,entry:archive.entry,legacy:false}]},
   dependencies:{rows:[]},downloads:{rows:[{version_id:1,count:0}]},
   advisories:{rows:[]}
  }}
  const catalog={archiveRoot,db:{snapshot:async()=>state}}
  server=createServer(createRegistryHandler(catalog))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const url='http://127.0.0.1:'+server.address().port
  const index=await(await fetch(url+'/v1/index')).json()
  assert.equal(index.packages[0].name,'demo')
  assert.deepEqual((await(await fetch(url+'/v1/packages/noqeri/demo/versions')).json()).versions.map(v=>v.version),['2.0.0','1.0.0'])
  assert.equal((await fetch(url+'/v1/packages/noqeri/demo/2.0.0/download')).status,404)
  assert.equal((await fetch(url+'/v1/packages/noqeri/%2e%2e%2fbad/1.0.0/download')).status,400)
  assert.equal((await fetch(url+'/v1/search?q=demo')).status,200)
  assert.equal((await fetch(url+'/v1/search?q='+('a'.repeat(129)))).status,400)
  assert.equal((await fetch(url+'/v1/packages/noqeri/demo',{method:'POST'})).status,405)
  const response=await fetch(url+'/v1/packages/noqeri/demo/1.0.0/download')
  assert.equal(response.status,200)
  const bytes=Buffer.from(await response.arrayBuffer())
  assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),archive.integrity)
  assert.equal(response.headers.get('x-archive-sha256'),archive.integrity.slice(7))
  const head=await fetch(url+'/v1/packages/noqeri/demo/1.0.0/download',{method:'HEAD'})
  assert.equal(head.status,200)
  assert.equal(head.headers.get('content-length'),String(bytes.length))
  await writeFile(join(archiveRoot,stored),'tampered')
  const bad=await fetch(url+'/v1/packages/noqeri/demo/1.0.0/download')
  assert.equal(bad.status,503)
  assert.equal((await bad.json()).error,'artifact_integrity_mismatch')
 } finally{
  if(server)await new Promise(resolve=>server.close(resolve))
  await rm(root,{recursive:true,force:true})
 }
})
