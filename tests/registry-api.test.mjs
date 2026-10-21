import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {mkdtemp,rm,writeFile,readFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
import {makeArchive} from '../service/archive.mjs'
import {openRegistry} from '../service/catalog.mjs'
const fixture=async fn=>{const dir=await mkdtemp(join(tmpdir(),'noqeri-registry-'));try{await fn(dir)}finally{await rm(dir,{force:true,recursive:true})}}
test('archive is deterministic, refuses a missing manifest and uses .nqpkg hash',()=>fixture(async dir=>{
 const dirPkg=join(dir,'pkg');await mkdir(join(dirPkg,'src'),{recursive:true})
 await writeFile(join(dirPkg,'package.noqeri'),'package { entry: "src/main.noqeri" }\n')
 await writeFile(join(dirPkg,'src/main.noqeri'),'module demo\n')
 const a=await makeArchive(dirPkg),b=await makeArchive(dirPkg)
 assert.deepEqual(a.bytes,b.bytes)
 assert.equal(a.integrity,'sha256:'+createHash('sha256').update(a.bytes).digest('hex'))
}))
test('NoeSQL registry import persists .noedb; exact pinned yanked releases remain downloadable',()=>fixture(async dir=>{
 const pkg=join(dir,'packages','noqeri','demo','1.0.0');await mkdir(join(pkg,'src'),{recursive:true})
 await writeFile(join(pkg,'package.noqeri'),'package { entry: "src/main.noqeri" }\n')
 await writeFile(join(pkg,'src/main.noqeri'),'module demo\n')
 await mkdir(join(dir,'registry'))
 await writeFile(join(dir,'registry/index.json'),JSON.stringify({protocol:'v1',packages:[{namespace:'noqeri',name:'demo',description:'Example',versions:[{version:'1.0.0',path:'packages/noqeri/demo/1.0.0',yanked:true}]}]}))
 const data=join(dir,'state')
 const service=await openRegistry({root:dir,data})
 const index=await service.snapshot()
 assert.equal(index.packages[0].versions[0].yanked,true)
 const {bytes,release}=await service.archive('noqeri','demo','1.0.0')
 assert.equal(release.integrity,'sha256:'+createHash('sha256').update(bytes).digest('hex'))
 assert.equal((await readFile(join(data,'registry.noedb'))).subarray(0,8).toString('ascii'),'NQDB0002')
 const restored=await openRegistry({root:dir,data})
 assert.deepEqual(await restored.snapshot(),index)
}))
