#!/usr/bin/env node
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root=resolve(process.argv[2]||process.cwd())
const output=join(root,'dist','compatibility')
const quality=JSON.parse(await readFile(join(root,'registry','quality.json'),'utf8'))
let matrixInput={format:'noqeri-compat-results-v1',compilerReleases:[],results:[]}
try{matrixInput=JSON.parse(await readFile(join(root,'registry','compatibility-results.json'),'utf8'))}catch{}
const releases=[...new Set(matrixInput.compilerReleases||[])].sort()
const resultMap=new Map((matrixInput.results||[]).map(x=>[`${x.package}@${x.packageVersion}|${x.compiler}`,x]))
const packages=[]
const packagesRoot=join(root,'packages')
for(const ns of (await readdir(packagesRoot,{withFileTypes:true})).filter(x=>x.isDirectory())){
  for(const pkg of (await readdir(join(packagesRoot,ns.name),{withFileTypes:true})).filter(x=>x.isDirectory())){
    const coordinate=`${ns.name}/${pkg.name}`
    const versions=(await readdir(join(packagesRoot,ns.name,pkg.name),{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort()
    for(const packageVersion of versions)packages.push({coordinate,packageVersion,quality:quality.levels?.[coordinate]||quality.default||'experimental'})
  }
}
packages.sort((a,b)=>a.coordinate.localeCompare(b.coordinate)||a.packageVersion.localeCompare(b.packageVersion))
const rows=packages.map(pkg=>({
  package:pkg.coordinate,packageVersion:pkg.packageVersion,quality:pkg.quality,
  compilers:Object.fromEntries(releases.map(compiler=>{const r=resultMap.get(`${pkg.coordinate}@${pkg.packageVersion}|${compiler}`);return[compiler,r?{status:r.status,details:r.details||''}:{status:'not-tested',details:''}]}))
}))
await mkdir(output,{recursive:true})
await writeFile(join(output,'matrix.json'),JSON.stringify({format:'noqeri-compatibility-dashboard-v1',compilerReleases:releases,rows},null,2)+'\n')
const header=releases.map(x=>`<th>${x}</th>`).join('')
const body=rows.map(row=>`<tr><td>${row.package}</td><td>${row.packageVersion}</td><td>${row.quality}</td>${releases.map(c=>`<td>${row.compilers[c].status}</td>`).join('')}</tr>`).join('\n')
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Noqeri package compatibility</title><style>body{font:14px system-ui;margin:32px;color:#18181b}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d4d4d8;padding:8px;text-align:left}th{background:#f4f4f5}</style><h1>Noqeri package compatibility</h1><p>Every package version × supported compiler release. Missing evidence is shown as <strong>not-tested</strong>, never inferred as compatible.</p><table><thead><tr><th>Package</th><th>Version</th><th>Quality</th>${header}</tr></thead><tbody>${body}</tbody></table>`
await writeFile(join(output,'index.html'),html)
console.log(`compatibility-dashboard: packages=${rows.length} compiler-releases=${releases.length}`)
