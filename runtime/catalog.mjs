// Registry metadata lives exclusively in the NoeSQL .noedb store.
// Source registry/index.json is a one-time, explicit bootstrap import only.
import { readFile, stat } from 'node:fs/promises'
import { resolve, join, relative, sep } from 'node:path'
import { database } from 'noesql/session'
import { IDENT, SEMVER, makeArchive, storeArchive } from './archive.mjs'
import { compareSemver, isValidSemver } from './semver.mjs'
const schema=`table packages {
 id: int key auto
 namespace: text required
 name: text required
 description: text
}
table versions {
 id: int key auto
 package_id: ref packages required
 version: text required
 yanked: bool = false
 archive_integrity: text required
 archive_location: text required
 entry: text required
 legacy: bool = false
}
table dependencies {
 id: int key auto
 version_id: ref versions required
 alias: text required
 coordinate: text required
 pinned_version: text required
}
table publishers {
 id: int key auto
 namespace: text required
 name: text required
}
table package_publishers {
 id: int key auto
 package_id: ref packages required
 publisher_id: ref publishers required
}
table downloads {
 id: int key auto
 version_id: ref versions required
 count: int = 0
}
table advisories {
 id: int key auto
 package_id: ref packages required
 advisory_key: text required
 severity: text required
 summary: text required
 affected: text required
 withdrawn: bool = false
}`
const lit=v=>JSON.stringify(String(v))
const validated=(s,re,label)=>{if(typeof s!=='string'||!re.test(s)||(re===SEMVER&&!isValidSemver(s)))throw new Error('invalid '+label+': '+s);return s}
const safePackageDir=(root,ns,name,version)=>{
  validated(ns,IDENT,'namespace');validated(name,IDENT,'name');validated(version,SEMVER,'version')
  return join(resolve(root),'packages',ns,name,version)
}
export async function openCatalog({root=process.cwd(),databasePath=join(root,'registry.noedb'),archiveRoot=join(root,'artifacts')}={}) {
  const db=database(resolve(databasePath))
  const state=await db.snapshot()
  const names=['packages','versions','dependencies','publishers','package_publishers','downloads','advisories']
  if(names.every(name=>!state.tables[name]))await db.execute(schema)
  else if(names.some(name=>!state.tables[name]))throw new Error('partially initialized registry database; explicit schema migration required')
  return {db,root:resolve(root),archiveRoot:resolve(archiveRoot)}
}
export async function importInitialIndex(catalog,{indexPath=join(catalog.root,'registry/index.json')}={}) {
  const current=await catalog.db.snapshot()
  if(current.tables.packages.rows.length!==0||current.tables.versions.rows.length!==0)throw new Error('registry metadata already initialized; bootstrap will not overwrite it')
  const index=JSON.parse(await readFile(indexPath,'utf8'))
  if(!index || !Array.isArray(index.packages))throw new Error('invalid bootstrap index')
  const seen=new Set(), commands=[]
  // Archive bytes live on disk, never inside NoeSQL.
  // Import each identity with a separate NoeSQL transaction; on interruption
  // an operator must inspect/restore the backup before retrying.
  for(const pkg of index.packages) {
    const ns=validated(pkg.namespace,IDENT,'namespace'),name=validated(pkg.name,IDENT,'package name')
    if(seen.has(ns+'/'+name))throw new Error('duplicate package')
    seen.add(ns+'/'+name)
    if(!Array.isArray(pkg.versions))throw new Error('invalid versions')
    const versions=[]
    const versionSeen=new Set()
    for(const rel of pkg.versions) {
      const version=validated(rel.version,SEMVER,'version')
      if(versionSeen.has(version))throw new Error('duplicate version')
      versionSeen.add(version)
      const expected='packages/'+ns+'/'+name+'/'+version
      if(rel.path!==expected)throw new Error('unsafe release path: '+rel.path)
      const directory=safePackageDir(catalog.root,ns,name,version)
      const info=await stat(directory)
      if(!info.isDirectory())throw new Error('release directory not found')
      const archive=await makeArchive(directory)
      if(rel.integrity && archive.fileIntegrity!==rel.integrity)throw new Error('source integrity mismatch: '+expected)
      const location=await storeArchive(catalog.archiveRoot,archive)
      versions.push({version,archive,location,yanked:rel.yanked===true})
    }
    commands.push({pkg,versions})
  }
  for(const {pkg,versions} of commands){
    const snapshot=await catalog.db.snapshot()
    const id=snapshot.tables.packages.nextId
    await catalog.db.execute('packages add {namespace:'+lit(pkg.namespace)+',name:'+lit(pkg.name)+',description:'+lit(pkg.description||'')+'}')
    for(const rel of versions) {
      const versionSnapshot=await catalog.db.snapshot()
      const versionId=versionSnapshot.tables.versions.nextId
      await catalog.db.execute('versions add {package_id:'+id+',version:'+lit(rel.version)+',yanked:'+(rel.yanked?'true':'false')+',archive_integrity:'+lit(rel.archive.integrity)+',archive_location:'+lit(rel.location)+',entry:'+lit(rel.archive.entry)+',legacy:'+(rel.archive.legacy?'true':'false')+'}')
      await catalog.db.execute('downloads add {version_id:'+versionId+',count:0}')
      for(const [alias,ref] of Object.entries(rel.archive.dependencies)){
        const index=ref.lastIndexOf('@'),coordinate=ref.slice(0,index),pin=ref.slice(index+1)
        if(!/^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/.test(coordinate)||!SEMVER.test(pin))throw new Error('invalid dependency pin: '+ref)
        await catalog.db.execute('dependencies add {version_id:'+versionId+',alias:'+lit(alias)+',coordinate:'+lit(coordinate)+',pinned_version:'+lit(pin)+'}')
      }
    }
  }
  return {packages:commands.length,versions:commands.reduce((n,p)=>n+p.versions.length,0)}
}
export async function catalogSnapshot(catalog){
  const value=await catalog.db.snapshot(),packages=value.tables.packages.rows,versions=value.tables.versions.rows
  const dependencies=value.tables.dependencies.rows,downloads=value.tables.downloads.rows
  const decorated=packages.map(pkg=>({
    namespace:pkg.namespace,name:pkg.name,description:pkg.description,
    versions:versions.filter(v=>v.package_id===pkg.id).map(v=>({version:v.version,yanked:v.yanked,archiveIntegrity:v.archive_integrity,
      entry:v.entry,legacy:v.legacy,dependencies:Object.fromEntries(dependencies.filter(d=>d.version_id===v.id).map(d=>[d.alias,d.coordinate+'@'+d.pinned_version])),downloads:downloads.find(d=>d.version_id===v.id)?.count||0})).sort((a,b)=>compareSemver(b.version,a.version))
  })).sort((a,b)=>(a.namespace+'/'+a.name).localeCompare(b.namespace+'/'+b.name,'en'))
  return {packages:decorated,locations:new Map(versions.map(v=>[v.package_id+'/'+v.version,v.archive_location])),ids:new Map(packages.map(p=>[p.namespace+'/'+p.name,p.id]))}
}
