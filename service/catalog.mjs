import {readFile,stat,mkdir} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
import {makeArchive,writeImmutableArchive} from './archive.mjs'
import {isAbsolute} from 'node:path'
import {pathToFileURL} from 'node:url'
// Load the one upstream NoeSQL implementation, never a registry-side fork.
// Local multi-repo development can point to the checkout until npm is verified.
const moduleSpecifier=process.env.NOESQL_STORE_PATH
if(moduleSpecifier&&!isAbsolute(moduleSpecifier))throw Error('NOESQL_STORE_PATH must be absolute')
let provider
try {
 provider=await import(moduleSpecifier?pathToFileURL(moduleSpecifier).href:'noesql/store')
} catch(error) {
 throw Error('NoeSQL store unavailable: install the qualified NoeSQL package or set NOESQL_STORE_PATH to its Runtime/noesql-store.mjs: '+error.message)
}
const {readNqd,runNqd}=provider
if(typeof readNqd!=='function'||typeof runNqd!=='function')throw Error('NoeSQL store provider lacks required API')
const PART=/^[a-z0-9][a-z0-9-]*$/
const SEMVER=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
export function checkIdentity(ns,name,version) {
 if(!PART.test(ns||'')||!PART.test(name||'')||(version!==undefined&&!SEMVER.test(version)))throw Object.assign(Error('invalid package identity'),{status:400})
}
const schema=`table packages {
 id:int key auto
 namespace:text required
 name:text required
 description:text
}
table versions {
 id:int key auto
 package_id:ref packages required
 version:text required
 archive_path:text required
 integrity:text required
 entry:text required
 yanked:bool required
}
table dependencies {
 id:int key auto
 version_id:ref versions required
 coordinate:text required
 constraint:text required
}
table publishers { id:int key auto
 name:text required
}
table downloads { id:int key auto
 version_id:ref versions required
 count:int required
}
table advisories { id:int key auto
 package_id:ref packages required
 advisory_id:text required
 summary:text required
}`
const quote=s=>JSON.stringify(String(s))
const cmp=(a,b)=>{
 const pa=a.split(/[.+-]/),pb=b.split(/[.+-]/)
 for(let i=0;i<3;i++){const x=BigInt(pa[i]),y=BigInt(pb[i]);if(x!==y)return x<y?-1:1}
 const xa=a.includes('-')?a.split('-')[1].split('+')[0].split('.'):[],xb=b.includes('-')?b.split('-')[1].split('+')[0].split('.'):[]
 if(!xa.length||!xb.length)return xa.length===xb.length?0:xa.length?-1:1
 for(let i=0;i<Math.max(xa.length,xb.length);i++){
  if(i>=xa.length)return -1;if(i>=xb.length)return 1
  const na=/^\d+$/.test(xa[i]),nb=/^\d+$/.test(xb[i])
  if(na&&nb){let x=BigInt(xa[i]),y=BigInt(xb[i]);if(x!==y)return x<y?-1:1}
  else if(na!==nb)return na?-1:1
  else if(xa[i]!==xb[i])return xa[i]<xb[i]?-1:1
 }
 return 0
}
export async function openRegistry({root=process.cwd(),data=join(process.cwd(),'data')}={}) {
 root=resolve(root);data=resolve(data)
 await mkdir(data,{recursive:true,mode:0o700})
 const file=join(data,'registry.noedb'),objects=join(data,'artifacts')
 let exists=true
 try {await stat(file)}catch(e){if(e.code==='ENOENT')exists=false;else throw e}
 if(!exists) {
  const index=JSON.parse(await readFile(join(root,'registry/index.json'),'utf8'))
  if(!Array.isArray(index.packages))throw Error('invalid bootstrap catalog')
  const script=[schema],keys=new Set()
  let packageId=0,versionId=0
  for(const pkg of index.packages) {
   checkIdentity(pkg.namespace,pkg.name)
   const k=pkg.namespace+'/'+pkg.name
   if(keys.has(k))throw Error('duplicate package '+k);keys.add(k)
   packageId++
   script.push(`packages add {namespace:${quote(pkg.namespace)},name:${quote(pkg.name)},description:${quote(pkg.description||'')}}`)
   const versions=new Set()
   for(const v of pkg.versions||[]) {
    checkIdentity(pkg.namespace,pkg.name,v.version)
    if(versions.has(v.version)||typeof v.yanked!=='boolean')throw Error('duplicate or invalid version')
    versions.add(v.version)
    const path=`packages/${pkg.namespace}/${pkg.name}/${v.version}`
    if(v.path!==path)throw Error('archive source path mismatch')
    const archive=await makeArchive(join(root,path))
    const stored=join(objects,pkg.namespace,pkg.name,v.version+'.nqpkg')
    await writeImmutableArchive(stored,archive)
    versionId++
    script.push(`versions add {package_id:${packageId},version:${quote(v.version)},archive_path:${quote([pkg.namespace,pkg.name,v.version+'.nqpkg'].join('/'))},integrity:${quote(archive.integrity)},entry:${quote(archive.entry)},yanked:${v.yanked?'true':'false'}}`)
    const manifest=await readFile(join(root,path,(await stat(join(root,path,'package.noqeri')).then(()=> 'package.noqeri').catch(()=> 'package.nqr'))),'utf8')
    const deps=/\bdependencies\s*\{([^}]*)\}/m.exec(manifest)?.[1]||''
    for(const m of deps.matchAll(/\b[A-Za-z_][A-Za-z_0-9]*\s*:\s*"([a-z0-9-]+\/[a-z0-9-]+)@([^"]+)"/g)) {
     if(!SEMVER.test(m[2]))throw Error('invalid dependency version')
     script.push(`dependencies add {version_id:${versionId},coordinate:${quote(m[1])},constraint:${quote(m[2])}}`)
    }
   }
  }
  // Import is one NoeSQL transaction. If it fails, do not serve a partial catalog.
  await runNqd(file,script.join('\n'))
 }
 async function snapshot(){
  const state=await readNqd(file)
  const pack=state.tables.packages?.rows||[],vers=state.tables.versions?.rows||[],deps=state.tables.dependencies?.rows||[]
  const packages=pack.map(p=>({namespace:p.namespace,name:p.name,description:p.description,versions:vers.filter(v=>v.package_id===p.id).map(v=>({
   version:v.version,yanked:v.yanked,integrity:v.integrity,entry:v.entry,
   path:`packages/${p.namespace}/${p.name}/${v.version}`,
   dependencies:deps.filter(d=>d.version_id===v.id).map(d=>({coordinate:d.coordinate,version:d.constraint}))
  })).sort((a,b)=>cmp(b.version,a.version))})).sort((a,b)=>(a.namespace+'/'+a.name).localeCompare(b.namespace+'/'+b.name))
  return {protocol:'v1',packageFormat:'nqpkg-1',packages}
 }
 async function archive(ns,name,version) {
  checkIdentity(ns,name,version)
  const index=await snapshot(),p=index.packages.find(p=>p.namespace===ns&&p.name===name)
  const v=p?.versions.find(v=>v.version===version)
  if(!v)throw Object.assign(Error('release not found'),{status:404})
  const filename=join(objects,ns,name,version+'.nqpkg')
  const bytes=await readFile(filename)
  const hash='sha256:'+createHash('sha256').update(bytes).digest('hex')
  if(hash!==v.integrity)throw Object.assign(Error('stored archive integrity mismatch'),{status:500})
  return {bytes,release:v}
 }
 return {snapshot,archive,file}
}
