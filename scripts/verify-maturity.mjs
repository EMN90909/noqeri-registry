#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root=resolve(process.argv[2]||process.cwd())
const quality=JSON.parse(await readFile(join(root,'registry','quality.json'),'utf8'))
const pending=JSON.parse(await readFile(join(root,'registry','pending-maturity-releases.json'),'utf8'))
const manifestPath=join(root,'packages','noqeri','concurrency','2.0.0','package.nqr')
const sourcePath=join(root,'packages','noqeri','concurrency','2.0.0','src','concurrency.nqr')
const testPath=join(root,'packages','noqeri','concurrency','2.0.0','tests','concurrency_test.nqr')
const manifest=await readFile(manifestPath,'utf8')
const source=await readFile(sourcePath,'utf8')
await stat(testPath)

function assert(condition,message){if(!condition)throw new Error(message)}
assert(quality.format==='noqeri-package-quality-v2','quality metadata must be v2')
assert(quality.versionLevels?.['noqeri/concurrency@1.0.0']==='experimental','legacy concurrency must remain experimental')
assert(quality.versionLevels?.['noqeri/concurrency@2.0.0']==='preview','canonical concurrency 2.0 must be preview')
assert(/version:\s*"2\.0\.0"/.test(manifest),'concurrency manifest version mismatch')
for(const symbol of ['taskHostSpawn','taskHostJoin','channelHostCreate','channelHostSendI64','mutexHostCreate','rwlockHostCreate']) assert(source.includes(symbol),`canonical runtime symbol missing: ${symbol}`)
for(const legacy of ['extern function taskSpawn(','extern function channelCreate(','extern function mutexCreate(','extern function rwlockCreate(']) assert(!source.includes(legacy),`legacy provider ABI leaked into 2.0: ${legacy}`)
const concurrency=pending.packages?.find(pkg=>pkg.namespace==='noqeri'&&pkg.name==='concurrency')
const release=concurrency?.versions?.find(version=>version.version==='2.0.0')
assert(release?.quality==='preview'&&release?.experimental===false,'pending release must advertise preview canonical runtime')

const node=process.execPath
const site=spawnSync(node,[join(root,'scripts','build-package-site.mjs'),root],{cwd:root,encoding:'utf8'})
if(site.error)throw site.error
assert(site.status===0,`package site generation failed: ${site.stderr||site.stdout}`)
const index=JSON.parse(await readFile(join(root,'dist','pkg','index.json'),'utf8'))
const rendered=index.packages?.find(pkg=>pkg.coordinate==='noqeri/concurrency'&&pkg.version==='2.0.0')
assert(rendered?.quality==='preview','package site did not apply version-level quality')

const compiler=process.env.NOQERI_BIN
if(compiler){
  const result=spawnSync(resolve(compiler),['run',testPath],{cwd:root,encoding:'utf8',env:{...process.env,NOQERI_OFFLINE:'1'}})
  if(result.error)throw result.error
  assert(result.status===0,`concurrency package contract test failed: ${result.stderr||result.stdout}`)
}else{
  console.log('NOQERI_BIN not set: package execution test skipped; metadata/site checks still passed')
}
console.log('registry maturity verification: PASS')
