#!/usr/bin/env node
// Requires a verified Noqeri compiler; this gate intentionally cannot pass without one.
import {spawnSync} from 'node:child_process'
import {readFileSync,existsSync,readdirSync} from 'node:fs'
import {resolve,join,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const compiler=process.env.NOQERI_BIN
if(!compiler||!isAbsolute(compiler)||!existsSync(compiler)){console.error('Set NOQERI_BIN to an absolute path to a trusted Noqeri compiler');process.exit(2)}
const index=JSON.parse(readFileSync(join(root,'registry/index.json'),'utf8'))
let passed=0,failed=0
const check=(file)=>{
 const result=spawnSync(compiler,['check',file],{cwd:root,encoding:'utf8',timeout:45000})
 if(result.status===0&&!result.error){passed++;console.log('PASS '+file)}
 else{failed++;console.error('FAIL '+file+': '+(result.error?.message||result.stderr||'exit '+result.status))}
}
for(const pkg of index.packages){
 const active=pkg.versions.filter(v=>!v.yanked)
 if(active.length!==1||active[0].version!=='0.1.0'){failed++;console.error('FAIL active version '+pkg.namespace+'/'+pkg.name);continue}
 const dir=join(root,active[0].path)
 const manifest=readFileSync(join(dir,'package.noqeri'),'utf8')
 const match=/\bentry\s*:\s*"([^"]+)"/.exec(manifest)
 if(!match||!match[1].endsWith('.noqeri')){failed++;console.error('FAIL invalid entry '+dir);continue}
 check(join(dir,match[1]))
 const testDir=join(dir,'tests')
 if(existsSync(testDir))for(const f of readdirSync(testDir).filter(x=>x.endsWith('.noqeri')))check(join(testDir,f))
}
console.log(JSON.stringify({packages:index.packages.length,passed,failed,compiler}))
if(failed)process.exitCode=1
