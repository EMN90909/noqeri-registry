import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { openCatalog, importInitialIndex } from '../runtime/catalog.mjs'
import { makeArchive } from '../runtime/archive.mjs'
import { startRegistry } from '../runtime/server.mjs'
test('NoeSQL-backed Registry API serves exactly hashed archive and rejects yanked, traversal and repeat bootstrap', { skip: process.platform!=='linux' },async () => {
  const dir=await mkdtemp(join(tmpdir(),'noqeri-registry-e2e-'))
  let server
  try {
    for(const version of ['1.0.0','2.0.0']) {
      const folder=join(dir,'packages','noqeri','demo',version,'src')
      await mkdir(folder,{recursive:true})
      await writeFile(join(folder,'main.noqeri'),'module demo\nexport function ready(): bool { return true }\n')
      await writeFile(join(dir,'packages','noqeri','demo',version,'package.noqeri'),'package { name: "noqeri/demo" version: "'+version+'" entry: "src/main.noqeri" }\n')
    }
    await mkdir(join(dir,'registry'),{recursive:true})
    await writeFile(join(dir,'registry','index.json'),JSON.stringify({packages:[{namespace:'noqeri',name:'demo',description:'Example',versions:[
      {version:'1.0.0',path:'packages/noqeri/demo/1.0.0',yanked:false},
      {version:'2.0.0',path:'packages/noqeri/demo/2.0.0',yanked:true}
    ]}]}))
    const catalog=await openCatalog({root:dir})
    assert.deepEqual(await importInitialIndex(catalog),{packages:1,versions:2})
    await assert.rejects(importInitialIndex(catalog),/already initialized/)
    assert.equal((await readFile(join(dir,'registry.noedb'))).toString('ascii',0,8),'NQDB0002')
    ;({server}=await startRegistry({root:dir,host:'127.0.0.1',port:0}))
    const base='http://127.0.0.1:'+server.address().port
    const index=await(await fetch(base+'/v1/index')).json()
    assert.equal(index.packages[0].versions.length,2)
    const details=await(await fetch(base+'/v1/packages/noqeri/demo/1.0.0')).json()
    const archiveRes=await fetch(base+'/v1/packages/noqeri/demo/1.0.0/download')
    assert.equal(archiveRes.status,200)
    const archive=Buffer.from(await archiveRes.arrayBuffer())
    assert.equal('sha256:'+createHash('sha256').update(archive).digest('hex'),details.archiveIntegrity)
    assert.ok(gunzipSync(archive).includes(Buffer.from('package.noqeri')))
    assert.equal((await fetch(base+'/v1/packages/noqeri/demo/2.0.0/download')).status,404)
    assert.equal((await fetch(base+'/v1/packages/noqeri/..%2Fbad/1.0.0/download')).status,400)
    assert.equal((await fetch(base+'/v1/search?q=demo')).status,200)
    assert.deepEqual((await(await fetch(base+'/v1/packages/noqeri/demo/versions')).json()).versions.map(x=>x.version),['2.0.0','1.0.0'])
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve))
    await rm(dir,{recursive:true,force:true})
  }
})
test('archive builder refuses symlinks and directory traversal', async()=>{
  const dir=await mkdtemp(join(tmpdir(),'noqeri-registry-unsafe-'))
  try{
    await writeFile(join(dir,'package.noqeri'),'package { entry: "../outside.noqeri" }\n')
    await assert.rejects(makeArchive(dir),/unsafe archive path/)
  }finally{await rm(dir,{recursive:true,force:true})}
})
