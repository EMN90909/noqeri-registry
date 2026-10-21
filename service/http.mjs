import {createServer} from 'node:http'
import {checkIdentity} from './identity.mjs'
const MAX_URL=1024
const security={'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}
function send(req,res,status,body,type='application/json; charset=utf-8',extra={}){
 const bytes=Buffer.isBuffer(body)?body:Buffer.from(body)
 res.writeHead(status,{...security,'Content-Type':type,'Content-Length':bytes.byteLength,...extra})
 res.end(req.method==='HEAD'?undefined:bytes)
}
const error=(req,res,status,message)=>send(req,res,status,JSON.stringify({error:message}))
function segments(pathname){
 const raw=pathname.split('/').slice(1)
 if(raw.some(s=>!s||s.length>200))throw Error('invalid path component')
 return raw.map(s=>{
  let decoded;try{decoded=decodeURIComponent(s)}catch{throw Error('invalid URL encoding')}
  if(decoded==='.'||decoded==='..'||decoded.includes('/')||decoded.includes('\\')||decoded.includes('\0')||
     (decoded!==s&&encodeURIComponent(decoded)!==s))throw Error('noncanonical path component')
  return decoded
 })
}
export async function handleRequest(req,res,store){
 const method=req.method||'GET'
 if(method!=='GET'&&method!=='HEAD')return error(req,res,405,'method_not_allowed')
 if(typeof req.url!=='string'||req.url.length>MAX_URL)return error(req,res,400,'invalid_url')
 // URL normalizes dot-segments before pathname parsing; reject them first.
 for(const segment of req.url.split('?')[0].split('/')) {
  const dots=segment.toLowerCase().replaceAll('%2e','.')
  if(dots==='.'||dots==='..')return error(req,res,400,'invalid_url')
 }
 let url,parts;try{url=new URL(req.url,'http://localhost');parts=segments(url.pathname)}catch{return error(req,res,400,'invalid_url')}
 if(parts.length===1&&parts[0]==='health')return send(req,res,200,JSON.stringify({status:'ok',backend:'noesql'}))
 if(parts[0]!=='v1')return error(req,res,404,'not_found')
 const index=await store.snapshot()
 if(parts.length===2&&parts[1]==='index')return send(req,res,200,JSON.stringify(index))
 if(parts.length===2&&parts[1]==='packages')return send(req,res,200,JSON.stringify({packages:index.packages}))
 if(parts.length===2&&parts[1]==='search'){
  const q=(url.searchParams.get('q')||'').trim().toLowerCase()
  if(q.length>100)return error(req,res,400,'invalid_query')
  const packages=index.packages.filter(p=>(p.namespace+'/'+p.name+' '+p.description).toLowerCase().includes(q)).slice(0,100)
  return send(req,res,200,JSON.stringify({packages}))
 }
 if(parts[1]!=='packages'||parts.length<4||parts.length>6)return error(req,res,404,'not_found')
 const ns=parts[2],name=parts[3]
 try{checkIdentity(ns,name)}catch{return error(req,res,400,'invalid_package')}
 const pkg=index.packages.find(p=>p.namespace===ns&&p.name===name)
 if(!pkg)return error(req,res,404,'not_found')
 if(parts.length===4)return send(req,res,200,JSON.stringify(pkg))
 if(parts.length===5&&parts[4]==='versions')return send(req,res,200,JSON.stringify({versions:pkg.versions}))
 const version=parts[4]
 try{checkIdentity(ns,name,version)}catch{return error(req,res,400,'invalid_version')}
 const release=pkg.versions.find(v=>v.version===version)
 if(!release)return error(req,res,404,'not_found')
 if(parts.length===5)return send(req,res,200,JSON.stringify({namespace:ns,name,...release,download:`/v1/packages/${ns}/${name}/${encodeURIComponent(version)}/download`}))
 if(parts.length===6&&parts[5]==='download'){
  const {bytes}=await store.archive(ns,name,version)
  return send(req,res,200,bytes,'application/vnd.noqeri.package+gzip',{
   'X-Archive-SHA256':release.integrity.slice(7),
   'Content-Disposition':`attachment; filename="${ns}-${name}-${version}.nqpkg"`
  })
 }
 return error(req,res,404,'not_found')
}
export function createRegistryServer(store){
 if(!store||typeof store.snapshot!=='function'||typeof store.archive!=='function')throw Error('NoeSQL registry catalog provider is required')
 const server=createServer((req,res)=>handleRequest(req,res,store).catch(err=>{
  console.error('Registry API:',err.message)
  if(!res.headersSent)error(req,res,err.status===400?400:err.status===404?404:500,'registry_error')
 }))
 server.requestTimeout=10000;server.headersTimeout=12000;server.maxHeadersCount=80
 return server
}
