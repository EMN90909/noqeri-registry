import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {gunzipSync} from 'node:zlib'
import {makeArchive} from '../service/archive.mjs'
async function fixture(fn){const root=await mkdtemp(join(tmpdir(),'nqpkg-'));try{await fn(root)}finally{await rm(root,{recursive:true,force:true})}}
test('immutable NQPKG is reproducible, gzip tar, and hashed as transmitted',()=>fixture(async root=>{
 await mkdir(join(root,'src'))
 await writeFile(join(root,'package.noqeri'),'package { entry: "src/main.noqeri" }\n')
 await writeFile(join(root,'src/main.noqeri'),'module tests\n')
 const a=await makeArchive(root),b=await makeArchive(root)
 assert.deepEqual(a.bytes,b.bytes)
 assert.equal(a.integrity,'sha256:'+createHash('sha256').update(a.bytes).digest('hex'))
 assert.equal(gunzipSync(a.bytes).toString('utf8',0,100).split('\0')[0],'package.noqeri')
}))
test('archive builder refuses symlink input and missing/escaping entry',()=>fixture(async root=>{
 await mkdir(join(root,'src'))
 await writeFile(join(root,'package.noqeri'),'package { entry: "../bad" }\n')
 await assert.rejects(makeArchive(root),/entry missing or unsafe/)
 await writeFile(join(root,'package.noqeri'),'package { entry: "src/main.noqeri" }\n')
 await symlink(join(root,'package.noqeri'),join(root,'src/main.noqeri'))
 await assert.rejects(makeArchive(root),/links are not allowed/)
}))
