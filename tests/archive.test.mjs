import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,writeFile,rm,symlink,readFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {gunzipSync} from 'node:zlib'
import {makeArchive,safeRelative,storeArchive} from '../runtime/archive.mjs'
test('deterministic .nqpkg archives use exact SHA256 and local object storage',async()=>{
 const root=await mkdtemp(join(tmpdir(),'nqpkg-test-'))
 try{
  await mkdir(join(root,'src'),{recursive:true})
  await writeFile(join(root,'package.noqeri'),'package { entry: "src/lib.noqeri" }\n')
  await writeFile(join(root,'src/lib.noqeri'),'module example\n')
  const first=await makeArchive(root),second=await makeArchive(root)
  assert.deepEqual(first.bytes,second.bytes)
  assert.ok(gunzipSync(first.bytes).includes(Buffer.from('src/lib.noqeri')))
  assert.equal(first.integrity,'sha256:'+createHash('sha256').update(first.bytes).digest('hex'))
  const file=await storeArchive(join(root,'artifacts'),first)
  assert.match(file,/^sha256-[0-9a-f]{64}\.nqpkg$/)
  assert.deepEqual(await readFile(join(root,'artifacts',file)),first.bytes)
 }finally{await rm(root,{recursive:true,force:true})}
})
test('reject traversal, wrong entries, links and absolute paths',async()=>{
 for(const s of ['../bad','/etc/passwd','a\\b','x//y','x/./y','a/../b'])assert.throws(()=>safeRelative(s))
 const root=await mkdtemp(join(tmpdir(),'nqpkg-unsafe-'))
 try{
  await writeFile(join(root,'package.noqeri'),'package { entry: "../outside.noqeri" }\n')
  await assert.rejects(makeArchive(root),/unsafe/)
  await writeFile(join(root,'package.noqeri'),'package { entry: "missing.noqeri" }\n')
  await assert.rejects(makeArchive(root),/absent/)
  await symlink(join(root,'package.noqeri'),join(root,'alias'))
  await assert.rejects(makeArchive(root),/links forbidden/)
 }finally{await rm(root,{recursive:true,force:true})}
})
