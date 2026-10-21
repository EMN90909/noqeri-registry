import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { openCatalog, catalogSnapshot } from './catalog.mjs'
import { artifactFile, IDENT, SEMVER, MAX_BYTES } from './archive.mjs'
const HEADERS = {
  'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-store',
  'Content-Security-Policy':"default-src 'none'", 'Access-Control-Allow-Origin':'*'
}
function reply(req,res,status,data,contentType='application/json; charset=utf-8',other={}){
  res.writeHead(status,{...HEADERS,'Content-Type':contentType,...other})
  res.end(req.method==='HEAD'?undefined:contentType.startsWith('application/json')?JSON.stringify(data):data)
}
const bad=(req,res,status,message)=>reply(req,res,status,{error:message})
const validName=(value)=>typeof value==='string'&&IDENT.test(value)
const validVersion=(value)=>typeof value==='string'&&SEMVER.test(value)
const visible=record=>({namespace:record.namespace,name:record.name,description:record.description,versions:record.versions})
export function createRegistryHandler(catalog){
  return async function handler(req,res){
    if(req.method!=='GET' && req.method!=='HEAD')return bad(req,res,405,'method_not_allowed')
    let path,searchParams
    try {const url=new URL(req.url||'/', 'http://localhost');path=url.pathname;searchParams=url.searchParams}
    catch{return bad(req,res,400,'invalid_url')}
    if(path.length>512)return bad(req,res,414,'uri_too_long')
    try{
      if(path==='/health')return reply(req,res,200,{status:'ok',storage:'noesql',database:'registry.noedb',nativeQualified:false})
      const {packages,ids,locations}=await catalogSnapshot(catalog)
      if(path==='/v1/index')return reply(req,res,200,{protocol:'v1',packageFormat:'nqpkg-1',packages})
      if(path==='/v1/packages')return reply(req,res,200,{packages})
      if(path==='/v1/search'){
        const q=searchParams.get('q')||''
        if(q.length>128)return bad(req,res,400,'search_too_long')
        const matched=packages.filter(p=>(p.namespace+'/'+p.name+' '+p.description).toLowerCase().includes(q.toLowerCase()))
        return reply(req,res,200,{packages:matched})
      }
      const parts=path.split('/').slice(1)
      if(parts[0]!=='v1'||parts[1]!=='packages'||parts.length<4||parts.length>6)return bad(req,res,404,'not_found')
      const [, ,ns,name,version,action]=parts
      if(!validName(ns)||!validName(name))return bad(req,res,400,'invalid_package_identity')
      const pkg=packages.find(p=>p.namespace===ns&&p.name===name)
      if(!pkg)return bad(req,res,404,'package_not_found')
      if(parts.length===4)return reply(req,res,200,visible(pkg))
      if(parts.length===5 && version==='versions')return reply(req,res,200,{namespace:ns,name,versions:pkg.versions})
      if(!validVersion(version))return bad(req,res,400,'invalid_version')
      const release=pkg.versions.find(r=>r.version===version)
      if(!release)return bad(req,res,404,'release_not_found')
      if(parts.length===5)return reply(req,res,200,{namespace:ns,name,...release})
      if(action!=='download')return bad(req,res,404,'not_found')
      // Explicit pinned yanked versions are also refused. Lockfile offline
      // cache remains supported by clients, but the public service fails closed.
      if(release.yanked)return bad(req,res,404,'release_yanked')
      const id=ids.get(ns+'/'+name),stored=locations.get(id+'/'+version)
      const m=/^sha256-([0-9a-f]{64})\.nqpkg$/.exec(stored||'')
      if(!m || 'sha256:'+m[1]!==release.archiveIntegrity)return bad(req,res,503,'invalid_artifact_metadata')
      const bytes=await readFile(artifactFile(catalog.archiveRoot,m[1]))
      if(bytes.length>MAX_BYTES || 'sha256:'+createHash('sha256').update(bytes).digest('hex')!==release.archiveIntegrity)
        return bad(req,res,503,'artifact_integrity_mismatch')
      return reply(req,res,200,bytes,'application/vnd.noqeri.package+gzip',{
        'Content-Disposition':'attachment; filename="'+ns+'-'+name+'-'+version+'.nqpkg"',
        'Content-Length':String(bytes.length),'X-Archive-SHA256':m[1]
      })
    }catch(error){console.error('Registry request failed',error);return bad(req,res,500,'internal_error')}
  }
}
export async function startRegistry({root=process.cwd(),port=Number(process.env.PORT||8080),host='0.0.0.0'}={}){
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('invalid port')
  const catalog=await openCatalog({root})
  const server=createServer(createRegistryHandler(catalog))
  server.requestTimeout=10_000;server.headersTimeout=12_000;server.keepAliveTimeout=5000;server.maxHeadersCount=80
  await new Promise((resolve,reject)=>server.once('error',reject).listen(port,host,resolve))
  return {server,catalog}
}
if(process.argv[1] && import.meta.url===new URL('file://'+process.argv[1]).href){
  startRegistry().then(({server})=>console.log('Noqeri Registry listening on '+server.address().port))
    .catch(error=>{console.error(error);process.exitCode=1})
}
