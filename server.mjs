#!/usr/bin/env node
// Transitional HTTP/FS transport. NoeSQL alone owns registry metadata.
import {createServer} from 'node:http'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {openRegistry,checkIdentity} from './service/catalog.mjs'
const root=fileURLToPath(new URL('.',import.meta.url))
const port=Number(process.env.PORT||8080)
if(!Number.isInteger(port)||port<1||port>65535)throw Error('invalid PORT')
const registry=await openRegistry({root,data:resolve(process.env.NOQERI_REGISTRY_DATA||new URL('data/',import.meta.url).pathname)})
const MAX_URL=1024
const security={'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}
function reply(req,res,code,body,type='application/json; charset=utf-8',extra={}) {
 res.writeHead(code,{...security,'Content-Type':type,'Content-Length':Buffer.byteLength(body),...extra})
 res.end(req.method==='HEAD'?undefined:body)
}
const fail=(req,res,code,message)=>reply(req,res,code,Buffer.from(JSON.stringify({error:message})))
export async function handle(req,res,store=registry) {
 const method=req.method||'GET'
 if(method!=='GET'&&method!=='HEAD')return fail(req,res,405,'method_not_allowed')
 if(typeof req.url!=='string'||req.url.length>MAX_URL)return fail(req,res,400,'invalid_url')
 let url
 try{url=new URL(req.url,'http://localhost')}catch{return fail(req,res,400,'invalid_url')}
 const parts=url.pathname.split('/').slice(1)
 if(parts.some(p=>!p||p==='.'||p==='..'||p.includes('%')))return fail(req,res,400,'invalid_path')
 if(url.pathname==='/health')return reply(req,res,200,Buffer.from('{"status":"ok","backend":"noesql"}'))
 if(parts[0]!=='v1')return fail(req,res,404,'not_found')
 const index=await store.snapshot()
 if(parts.length===2&&parts[1]==='index')return reply(req,res,200,Buffer.from(JSON.stringify(index)))
 if(parts.length===2&&parts[1]==='packages')return reply(req,res,200,Buffer.from(JSON.stringify({packages:index.packages})))
 if(parts.length===2&&parts[1]==='search') {
  const q=(url.searchParams.get('q')||'').trim().toLowerCase()
  if(q.length>100)return fail(req,res,400,'invalid_query')
  const packages=index.packages.filter(p=>(p.namespace+'/'+p.name+' '+p.description).toLowerCase().includes(q)).slice(0,100)
  return reply(req,res,200,Buffer.from(JSON.stringify({packages})))
 }
 if(parts[1]!=='packages'||parts.length<4||parts.length>6)return fail(req,res,404,'not_found')
 const ns=parts[2],name=parts[3]
 try{checkIdentity(ns,name)}catch{return fail(req,res,400,'invalid_package')}
 const pkg=index.packages.find(p=>p.namespace===ns&&p.name===name)
 if(!pkg)return fail(req,res,404,'not_found')
 if(parts.length===4)return reply(req,res,200,Buffer.from(JSON.stringify(pkg)))
 if(parts.length===5&&parts[4]==='versions')return reply(req,res,200,Buffer.from(JSON.stringify({versions:pkg.versions})))
 const ver=parts[4]
 try{checkIdentity(ns,name,ver)}catch{return fail(req,res,400,'invalid_version')}
 const release=pkg.versions.find(v=>v.version===ver)
 if(!release)return fail(req,res,404,'not_found')
 if(parts.length===5)return reply(req,res,200,Buffer.from(JSON.stringify({namespace:ns,name,...release,download:`/v1/packages/${ns}/${name}/${ver}/download` })))
 if(parts.length===6&&parts[5]==='download'){
  const {bytes}=await store.archive(ns,name,ver)
  return reply(req,res,200,bytes,'application/vnd.noqeri.package+gzip',{
   'X-Archive-SHA256':release.integrity.slice(7),
   'Content-Disposition':`attachment; filename="${ns}-${name}-${ver}.nqpkg"`
  })
 }
 return fail(req,res,404,'not_found')
}
export function makeServer(store=registry) {
 const s=createServer((req,res)=>handle(req,res,store).catch(e=>{
  console.error('registry:',e.message)
  if(!res.headersSent)fail(req,res,e.status===400?400:e.status===404?404:500,'registry_error')
 }))
 s.requestTimeout=10_000;s.headersTimeout=12_000;s.maxHeadersCount=80
 return s
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 makeServer().listen(port,'0.0.0.0',()=>console.log('Noqeri Registry /v1 listening on '+port))
}
