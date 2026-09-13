#!/usr/bin/env node
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(process.argv[2] || process.cwd())
const packagesRoot = join(root, 'packages')
const outputRoot = join(root, 'dist', 'pkg')

function escapeHtml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
function compareText(a,b){return a<b?-1:a>b?1:0}
function field(text, name){return text.match(new RegExp(`\\b${name}\\s*:\\s*"([^"]+)"`))?.[1]||''}

async function loadPackages(){
  const packages=[]
  for(const ns of (await readdir(packagesRoot,{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>compareText(a.name,b.name))){
    const nsPath=join(packagesRoot,ns.name)
    for(const pkg of (await readdir(nsPath,{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>compareText(a.name,b.name))){
      const pkgPath=join(nsPath,pkg.name)
      const versions=(await readdir(pkgPath,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort(compareText).reverse()
      for(const version of versions){
        const versionPath=join(pkgPath,version)
        let manifest
        try{manifest=await readFile(join(versionPath,'package.nqr'),'utf8')}catch{continue}
        const coordinate=field(manifest,'name')||`${ns.name}/${pkg.name}`
        const actualVersion=field(manifest,'version')||version
        const entry=field(manifest,'entry')
        let readme=''
        try{readme=await readFile(join(versionPath,'README.md'),'utf8')}catch{}
        packages.push({coordinate,version:actualVersion,entry,readme})
      }
    }
  }
  return packages.sort((a,b)=>compareText(a.coordinate,b.coordinate)||compareText(b.version,a.version))
}

function plainMarkdown(markdown){
  return escapeHtml(markdown)
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\n\n+/g,'</p><p>')
    .replace(/^/,'<p>').replace(/$/,'</p>')
}

const packages=await loadPackages()
await mkdir(outputRoot,{recursive:true})
const latest=new Map()
for(const pkg of packages)if(!latest.has(pkg.coordinate))latest.set(pkg.coordinate,pkg)
const cards=[...latest.values()].map(pkg=>`<li><a href="${escapeHtml(pkg.coordinate)}/${escapeHtml(pkg.version)}/index.html"><strong>${escapeHtml(pkg.coordinate)}</strong></a><br><small>${escapeHtml(pkg.version)} · ${escapeHtml(pkg.entry)}</small></li>`).join('\n')
const index=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Noqeri packages</title><style>body{font:16px system-ui,sans-serif;max-width:960px;margin:48px auto;padding:0 20px;color:#18181b}a{color:inherit}li{margin:0 0 18px}code{background:#f4f4f5;padding:2px 5px;border-radius:5px}small{color:#71717a}</style><h1>Noqeri packages</h1><p>Generated package documentation index. Production deployment target: <code>pkg.noqeri.dev</code>.</p><ul>${cards}</ul>`
await writeFile(join(outputRoot,'index.html'),index)
await writeFile(join(outputRoot,'index.json'),JSON.stringify({format:'noqeri-pkg-index-v1',packages},null,2)+'\n')
for(const pkg of packages){
  const dir=join(outputRoot,...pkg.coordinate.split('/'),pkg.version)
  await mkdir(dir,{recursive:true})
  const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(pkg.coordinate)} ${escapeHtml(pkg.version)}</title><style>body{font:16px system-ui,sans-serif;max-width:840px;margin:48px auto;padding:0 20px;color:#18181b}code{background:#f4f4f5;padding:2px 5px;border-radius:5px}pre{overflow:auto}</style><p><a href="../../../../index.html">← packages</a></p><h1>${escapeHtml(pkg.coordinate)}</h1><p><strong>Version:</strong> ${escapeHtml(pkg.version)}<br><strong>Entry:</strong> <code>${escapeHtml(pkg.entry)}</code></p>${pkg.readme?plainMarkdown(pkg.readme):'<p><em>No README supplied.</em></p>'}`
  await writeFile(join(dir,'index.html'),html)
}
console.log(`package site: ${packages.length} package versions, ${latest.size} packages`)
