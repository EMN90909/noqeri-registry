#!/usr/bin/env node
import {spawnSync} from 'node:child_process'
import {readFileSync,existsSync} from 'node:fs'
import {resolve,join} from 'node:path'
const root=resolve(new URL('..',import.meta.url).pathname)
const compiler=process.env.NOQERI_BIN
if(!compiler||!existsSync(compiler)){console.error('Set NOQERI_BIN to a trusted executable; no compiler was found');process.exit(2)}
const catalog=JSON.parse(readFileSync(join(root,'registry/index.json'),'utf8'))
let passed=0,failed=0
for(const p of catalog.packages){
 const fixture=join(root,'packages',p.namespace,p.name,'0.4.0/tests/release_smoke.nqr')
 const r=spawnSync(compiler,['check',fixture],{cwd:root,encoding:'utf8',timeout:30000})
 if(r.status===0&&!r.error){passed++;console.log('PASS '+p.name)}
 else{failed++;console.error('FAIL '+p.name+': '+(r.error?.message||r.stderr||'exit '+r.status))}
}
console.log(JSON.stringify({passed,failed,total:catalog.packages.length}))
if(failed)process.exitCode=1
