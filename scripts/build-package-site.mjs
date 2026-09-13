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
async function optionalJson(path, fallback){try{return JSON.parse(await readFile(path,'utf8'))}catch{return fallback}}
async function listExampleNames(path){try{return (await readdir(path,{withFileTypes:true})).filter(x=>x.isFile()&&x.name.endsWith('.nqr')).map(x=>x.name).sort(compareText)}catch{return[]}}

function dependencies(manifest){
  const block=/\bdependencies\s*\{([\s\S]*?)\}/m.exec(manifest)?.[1]||''
  const out=[]
  for(const match of block.matchAll(/([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*"([A-Za-z0-9_-]+\/[A-Za-z0-9_-]+)(?:@([^"]+))?"/g)) out.push({alias:match[1],coordinate:match[2],version:match[3]||''})
  return out
}

async function loadPackages(securityReports, downloads){
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
        const edition=field(manifest,'edition')
        const target=field(manifest,'target')
        const profile=field(manifest,'profile')
        let readme=''
        try{readme=await readFile(join(versionPath,'README.md'),'utf8')}catch{}
        const sourceText=await readFile(join(versionPath,entry),'utf8').catch(()=> '')
        const license=sourceText.match(/SPDX-License-Identifier:\s*([^\s]+)/)?.[1]||'GPL-3.0-only'
        const securityMatches=(securityReports.reports||[]).filter(report=>report.package===coordinate&&(report.version===actualVersion||report.version==='*'))
        const securityStatus=securityMatches.some(report=>report.status!=='resolved'&&report.status!=='dismissed')?'attention':'clear'
        const examples=await listExampleNames(join(versionPath,'examples'))
        packages.push({
          coordinate,version:actualVersion,entry,edition,target,profile,license,
          dependencies:dependencies(manifest),examples,
          downloads:Number(downloads[`${coordinate}@${actualVersion}`]||downloads[coordinate]||0),
          securityStatus,
          source:`https://github.com/EMN90909/noqeri-registry/tree/main/packages/${coordinate}/${actualVersion}`,
          readme
        })
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

const securityReports=await optionalJson(join(root,'registry','security-reports.json'),{reports:[]})
const downloads=await optionalJson(join(root,'registry','downloads.json'),{})
const packages=await loadPackages(securityReports,downloads)
await mkdir(outputRoot,{recursive:true})
const latest=new Map()
for(const pkg of packages)if(!latest.has(pkg.coordinate))latest.set(pkg.coordinate,pkg)
const cards=[...latest.values()].map(pkg=>`<li><a href="${escapeHtml(pkg.coordinate)}/${escapeHtml(pkg.version)}/index.html"><strong>${escapeHtml(pkg.coordinate)}</strong></a><br><small>${escapeHtml(pkg.version)} · ${escapeHtml(pkg.license)} · ${pkg.downloads} downloads · security: ${escapeHtml(pkg.securityStatus)}</small></li>`).join('\n')
const index=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Noqeri packages</title><style>body{font:16px system-ui,sans-serif;max-width:960px;margin:48px auto;padding:0 20px;color:#18181b}a{color:inherit}li{margin:0 0 18px}code{background:#f4f4f5;padding:2px 5px;border-radius:5px}small{color:#71717a}</style><h1>Noqeri packages</h1><p>Generated package documentation index. Production deployment target: <code>pkg.noqeri.dev</code>.</p><ul>${cards}</ul>`
await writeFile(join(outputRoot,'index.html'),index)
await writeFile(join(outputRoot,'index.json'),JSON.stringify({format:'noqeri-pkg-index-v1',packages},null,2)+'\n')
for(const pkg of packages){
  const dir=join(outputRoot,...pkg.coordinate.split('/'),pkg.version)
  await mkdir(dir,{recursive:true})
  const dependencyHtml=pkg.dependencies.length?`<ul>${pkg.dependencies.map(dep=>`<li><code>${escapeHtml(dep.coordinate)}</code>${dep.version?` @ ${escapeHtml(dep.version)}`:''}</li>`).join('')}</ul>`:'<p>None declared.</p>'
  const exampleHtml=pkg.examples.length?`<ul>${pkg.examples.map(example=>`<li><code>${escapeHtml(example)}</code></li>`).join('')}</ul>`:'<p>No examples directory entries.</p>'
  const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(pkg.coordinate)} ${escapeHtml(pkg.version)}</title><style>body{font:16px system-ui,sans-serif;max-width:840px;margin:48px auto;padding:0 20px;color:#18181b}code{background:#f4f4f5;padding:2px 5px;border-radius:5px}pre{overflow:auto}dt{font-weight:700}dd{margin-bottom:8px}</style><p><a href="../../../../index.html">← packages</a></p><h1>${escapeHtml(pkg.coordinate)}</h1><dl><dt>Version</dt><dd>${escapeHtml(pkg.version)}</dd><dt>License</dt><dd>${escapeHtml(pkg.license)}</dd><dt>Entry</dt><dd><code>${escapeHtml(pkg.entry)}</code></dd><dt>Compatibility</dt><dd>edition ${escapeHtml(pkg.edition||'unspecified')} · target ${escapeHtml(pkg.target||'unspecified')} · profile ${escapeHtml(pkg.profile||'unspecified')}</dd><dt>Downloads</dt><dd>${pkg.downloads}</dd><dt>Security</dt><dd>${escapeHtml(pkg.securityStatus)}</dd><dt>Source</dt><dd><a href="${escapeHtml(pkg.source)}">repository source</a></dd></dl><h2>Dependencies</h2>${dependencyHtml}<h2>Examples</h2>${exampleHtml}${pkg.readme?plainMarkdown(pkg.readme):'<p><em>No README supplied.</em></p>'}`
  await writeFile(join(dir,'index.html'),html)
}
console.log(`package site: ${packages.length} package versions, ${latest.size} packages`)
