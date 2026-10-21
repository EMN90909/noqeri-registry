import { lstat, readdir, readFile, mkdir, writeFile, open } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { join, resolve, relative, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
const LIMIT_FILES=256, LIMIT_BYTES=8*1024*1024
const safe = s => typeof s==='string' && s.length>0 && !s.includes('\\') && !s.startsWith('/') && s.split('/').every(p=>p&&p!=='.'&&p!=='..'&&!p.includes('\0'))
const oct=(n,size)=>n.toString(8).padStart(size-1,'0')+'\0'
function header(path,size) {
 if(!safe(path)||Buffer.byteLength(path)>100)throw Error('unsafe or long archive path')
 const b=Buffer.alloc(512)
 b.write(path,0,100);b.write(oct(0o644,8),100,8)
 b.write(oct(0,8),108,8);b.write(oct(0,8),116,8)
 b.write(oct(size,12),124,12);b.write(oct(0,12),136,12)
 b.fill(32,148,156);b[156]=48;b.write('ustar\0',257);b.write('00',263)
 let checksum=0;for(const n of b)checksum+=n
 b.write(oct(checksum,8),148,8);return b
}
export async function makeArchive(root) {
 const base=resolve(root),files=[],state={count:0,bytes:0}
 async function walk(dir,depth) {
  if(depth>12)throw Error('package tree exceeds depth limit')
  const entries=await readdir(dir,{withFileTypes:true})
  entries.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)
  for(const entry of entries) {
   const file=join(dir,entry.name),name=relative(base,file).split(sep).join('/')
   if(!safe(name))throw Error('unsafe package path')
   const st=await lstat(file)
   if(st.isSymbolicLink())throw Error('links are not allowed in packages')
   if(st.isDirectory()){await walk(file,depth+1);continue}
   if(!st.isFile()||st.nlink!==1)throw Error('links are not allowed in packages')
   if(++state.count>LIMIT_FILES||st.size>LIMIT_BYTES-state.bytes)throw Error('package exceeds file/byte limits')
   const fh=await open(file,fsConstants.O_RDONLY|(fsConstants.O_NOFOLLOW||0))
   let data
   try {
    const before=await fh.stat()
    if(!before.isFile()||before.nlink!==1||before.size!==st.size||before.ino!==st.ino)throw Error('package file changed before read')
    data=Buffer.alloc(before.size)
    let at=0
    while(at<data.length){const {bytesRead}=await fh.read(data,at,data.length-at,at);if(!bytesRead)throw Error('package truncated while reading');at+=bytesRead}
    const after=await fh.stat()
    if(after.size!==before.size||after.ino!==before.ino||after.mtimeMs!==before.mtimeMs||after.ctimeMs!==before.ctimeMs)throw Error('package file changed during read')
   }finally{await fh.close()}
   state.bytes+=data.length;files.push({name,data})
  }
 }
 await walk(base,0)
 const manifest=files.find(f=>f.name==='package.noqeri')||files.find(f=>f.name==='package.nqr')
 if(!manifest)throw Error('package manifest missing (.noqeri canonical, .nqr legacy)')
 const entry=/\bentry\s*:\s*"([^"]+)"/.exec(manifest.data.toString('utf8'))?.[1]
 if(!safe(entry)||!files.some(f=>f.name===entry))throw Error('package entry missing or unsafe')
 const chunks=[]
 for(const f of files){
  chunks.push(header(f.name,f.data.length),f.data)
  const pad=(512-f.data.length%512)%512
  if(pad)chunks.push(Buffer.alloc(pad))
 }
 chunks.push(Buffer.alloc(1024))
 const bytes=gzipSync(Buffer.concat(chunks),{level:9,mtime:0})
 return {bytes,integrity:'sha256:'+createHash('sha256').update(bytes).digest('hex'),entry,files:files.length}
}
export async function writeImmutableArchive(target,archive){
 await mkdir(resolve(target,'..'),{recursive:true,mode:0o700})
 try {await writeFile(target,archive.bytes,{flag:'wx',mode:0o600})}
 catch(e){
  if(e.code!=='EEXIST')throw e
  const fh=await open(target,fsConstants.O_RDONLY|(fsConstants.O_NOFOLLOW||0))
  try {
   const st=await fh.stat()
   if(!st.isFile()||st.nlink!==1||st.size>10*1024*1024)throw Error('unsafe immutable release file')
   const old=await fh.readFile()
   if('sha256:'+createHash('sha256').update(old).digest('hex')!==archive.integrity)throw Error('immutable release archive mismatch')
  }finally{await fh.close()}
 }
}
