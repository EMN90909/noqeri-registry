import { createGzip } from 'node:zlib'
import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { once } from 'node:events'

const out = new URL('../distribution/', import.meta.url)
await mkdir(out, { recursive: true })

function octal(value, width) {
  const text = value.toString(8).padStart(width - 1, '0')
  return Buffer.from(text + '\0')
}
function header(name, size) {
  const h = Buffer.alloc(512)
  Buffer.from(name).copy(h, 0)
  octal(0o644, 8).copy(h, 100)
  octal(0, 8).copy(h, 108)
  octal(0, 8).copy(h, 116)
  octal(size, 12).copy(h, 124)
  octal(0, 12).copy(h, 136)
  h.fill(32, 148, 156)
  h[156] = 48
  Buffer.from('ustar\0').copy(h, 257)
  Buffer.from('00').copy(h, 263)
  Buffer.from('noqeri').copy(h, 265)
  Buffer.from('noqeri').copy(h, 297)
  const sum = h.reduce((total, byte) => total + byte, 0)
  octal(sum, 8).copy(h, 148)
  return h
}
async function files(dir, base = dir, result = []) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) await files(absolute, base, result)
    else if ((await stat(absolute)).isFile()) result.push({ name: relative(base, absolute).split('\\').join('/'), bytes: await readFile(absolute) })
  }
  return result.sort((a,b) => a.name.localeCompare(b.name))
}
for (const packageName of ['cli','std-io','fs','net','http','json','crypto','sync','regex']) {
  const packageRoot = new URL('../../packages/' + packageName + '/', import.meta.url)
  const entries = await files(packageRoot.pathname)
  const tarParts = []
  for (const { name, bytes } of entries) tarParts.push(header(name, bytes.length), bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512))
  tarParts.push(Buffer.alloc(1024))
  const tar = Buffer.concat(tarParts)
  const gzip = createGzip({ level: 9, mtime: 0 })
  const chunks = []
  gzip.on('data', chunk => chunks.push(chunk))
  gzip.end(tar)
  await once(gzip, 'end')
  await writeFile(new URL('noqeri-' + packageName + '-1.0.0.ndl', out), Buffer.concat(chunks))
}

