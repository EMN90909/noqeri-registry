// Deterministic .nqpkg tar.gz, bounded to prevent traversal, symlinks and zip bombs.
import { createHash } from 'node:crypto'
import { readdir, readFile, lstat, mkdir, writeFile } from 'node:fs/promises'
import { resolve, join, relative, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
export const MAX_FILES = 256, MAX_BYTES = 8 * 1024 * 1024
export const IDENT = /^[a-z0-9][a-z0-9-]*$/
export const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const HASH = /^[0-9a-f]{64}$/
export function safeRelative(p) {
  if (typeof p !== 'string' || !p || p.startsWith('/') || p.includes('\\') || p.includes('\0') || p.split('/').some(s => !s || s === '.' || s === '..')) throw new Error('unsafe archive path')
  return p
}
function oct(n, width) { return n.toString(8).padStart(width-1,'0')+'\0' }
function header(name, bytes) {
  safeRelative(name)
  if (Buffer.byteLength(name) > 100) throw new Error('tar path exceeds 100 bytes')
  const h = Buffer.alloc(512)
  h.write(name,0,100,'utf8')
  h.write(oct(0o644,8),100,8,'ascii')
  h.write(oct(0,8),108,8,'ascii')
  h.write(oct(0,8),116,8,'ascii')
  h.write(oct(bytes,12),124,12,'ascii')
  h.write(oct(0,12),136,12,'ascii')
  h.fill(32,148,156);h[156]=48
  h.write('ustar\0',257,6,'ascii');h.write('00',263,2,'ascii')
  let total=0;for(const byte of h)total+=byte
  h.write(oct(total,8),148,8,'ascii')
  return h
}
export async function makeArchive(root) {
  const base = resolve(root), files = []
  let total = 0, directories = 0
  async function walk(dir, depth) {
    if (depth > 12 || ++directories > 256) throw new Error('package nesting limit exceeded')
    for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const full=join(dir,entry.name), path=relative(base,full).split(sep).join('/')
      safeRelative(path)
      const st=await lstat(full)
      if(st.isSymbolicLink() || st.nlink!==1 && st.isFile()) throw new Error('package links forbidden')
      if(st.isDirectory()) {await walk(full,depth+1);continue}
      if(!st.isFile()) throw new Error('package must contain regular files')
      if(files.length>=MAX_FILES || st.size>MAX_BYTES-total) throw new Error('package size/file limit exceeded')
      const data=await readFile(full)
      total+=data.length
      if(total>MAX_BYTES)throw new Error('package exceeds byte limit')
      files.push({name:path,data})
    }
  }
  await walk(base,0)
  files.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)
  const manifest=files.find(f=>f.name==='package.noqeri')||files.find(f=>f.name==='package.noqeri')
  if(!manifest)throw new Error('package manifest missing (package.noqeri required)')
  const match=/\bentry\s*:\s*"([^"]+)"/.exec(manifest.data.toString('utf8'))
  const entry=safeRelative(match?.[1])
  if(!files.some(f=>f.name===entry))throw new Error('entry absent from archive')
  const fileHash=createHash('sha256')
  const tar=[]
  for(const f of files){
    fileHash.update(f.name);fileHash.update('\0');fileHash.update(f.data);fileHash.update('\0')
    tar.push(header(f.name,f.data.length),f.data)
    if(f.data.length%512)tar.push(Buffer.alloc(512-f.data.length%512))
  }
  tar.push(Buffer.alloc(1024))
  const bytes=gzipSync(Buffer.concat(tar),{mtime:0,level:9})
  if(bytes.length>MAX_BYTES)throw new Error('archive exceeds compressed byte limit')
  return {bytes,integrity:'sha256:'+createHash('sha256').update(bytes).digest('hex'),fileIntegrity:'sha256:'+fileHash.digest('hex'),entry,legacy:false,
    dependencies:Object.fromEntries([...manifest.data.toString('utf8').matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"([a-z0-9-]+\/[a-z0-9-]+@[^"]+)"\s*$/gm)].map(m=>[m[1],m[2]]))}
}
export function artifactFile(root, sha) {
  if(!HASH.test(sha))throw new Error('invalid archive digest')
  return resolve(root,'sha256-'+sha+'.nqpkg')
}
export async function storeArchive(root, archive) {
  const sha=archive.integrity.slice(7)
  await mkdir(root,{recursive:true,mode:0o700})
  const path=artifactFile(root,sha)
  try { const old=await readFile(path);if(createHash('sha256').update(old).digest('hex')!==sha)throw new Error('corrupt stored archive') }
  catch(error) {if(error.code!=='ENOENT')throw error;await writeFile(path,archive.bytes,{flag:'wx',mode:0o600})}
  return 'sha256-'+sha+'.nqpkg'
}
