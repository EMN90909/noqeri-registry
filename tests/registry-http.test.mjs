import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createRegistryServer} from '../service/http.mjs'
const archive=Buffer.from('fake archive transport')
const integrity='sha256:'+'a'.repeat(64)
const store={
 async snapshot(){return {protocol:'v1',packageFormat:'nqpkg-1',packages:[{namespace:'noqeri',name:'demo',description:'Demo',versions:[{version:'1.0.0+build',yanked:true,integrity,path:'packages/noqeri/demo/1.0.0+build'}]}]}},
 async archive(ns,name,version){assert.equal(ns,'noqeri');assert.equal(name,'demo');assert.equal(version,'1.0.0+build');return {bytes:archive}}
}
test('Registry HTTP API is versioned and supports semver + encoding and pinned yanked releases',async()=>{
 const server=createRegistryServer(store)
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const origin='http://127.0.0.1:'+server.address().port
 try {
  const index=await fetch(origin+'/v1/index')
  assert.equal(index.status,200)
  assert.equal((await index.json()).packages[0].name,'demo')
  const one=await fetch(origin+'/v1/packages/noqeri/demo/1.0.0%2Bbuild')
  assert.equal(one.status,200)
  assert.equal((await one.json()).yanked,true)
  const file=await fetch(origin+'/v1/packages/noqeri/demo/1.0.0%2Bbuild/download')
  assert.equal(file.status,200)
  assert.deepEqual(Buffer.from(await file.arrayBuffer()),archive)
  assert.equal(file.headers.get('x-archive-sha256'),'a'.repeat(64))
  assert.equal((await (await fetch(origin+'/v1/search?q=demo')).json()).packages.length,1)
  assert.equal((await fetch(origin+'/v1/packages/noqeri/demo/1.0.0%2Fescape')).status,400)
  assert.ok([400,404].includes((await fetch(origin+'/v1/packages/%2E%2E/demo/1.0.0')).status)) // WHATWG fetch normalizes dot segments before transport
  assert.equal((await fetch(origin+'/v1/packages/noqeri/demo/not-semver')).status,400)
  assert.equal((await fetch(origin+'/v1/packages/noqeri/demo/1.0.0%2Bbuild/download',{method:'POST'})).status,405)
 }finally{await new Promise(resolve=>server.close(resolve))}
})
