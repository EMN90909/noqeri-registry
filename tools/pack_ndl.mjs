import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

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
function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (~crc) >>> 0
}
function appendLe32(output, value) {
  for (let shift = 0; shift < 32; shift += 8) output.push((value >>> shift) & 0xff)
}
function gzipStored(bytes) {
  const output = [0x1f, 0x8b, 0x08, 0, 0, 0, 0, 0, 0, 3]
  for (let offset = 0; offset < bytes.length;) {
    const length = Math.min(65535, bytes.length - offset)
    const final = offset + length === bytes.length
    output.push(final ? 1 : 0, length & 0xff, length >>> 8, (~length) & 0xff, (~length >>> 8) & 0xff)
    output.push(...bytes.subarray(offset, offset + length)); offset += length
  }
  appendLe32(output, crc32(bytes)); appendLe32(output, bytes.length >>> 0)
  return Buffer.from(output)
}
for (const [packageName, version] of [['cli','1.0.0'],['std-io','1.0.0'],['fs','1.0.0'],['net','1.0.0'],['http','1.0.0'],['json','1.0.0'],['crypto','1.0.0'],['sync','1.0.0'],['regex','1.0.0'],['components','0.2.1'],['noesql','0.9.5']]) {
  const packageRoot = new URL('../../packages/' + packageName + '/', import.meta.url)
  const entries = await files(packageRoot.pathname)
  const tarParts = []
  for (const { name, bytes } of entries) tarParts.push(header(name, bytes.length), bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512))
  tarParts.push(Buffer.alloc(1024))
  const tar = Buffer.concat(tarParts)
  await writeFile(new URL('noqeri-' + packageName + '-' + version + '.ndl', out), gzipStored(tar))
}

