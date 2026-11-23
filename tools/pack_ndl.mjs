import { readdir, readFile, stat, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, relative, dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const registryRoot = resolve(__dirname, '..')
const outDir = resolve(registryRoot, 'distribution')
const workspaceRoot = resolve(registryRoot, '..')

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

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
async function collectFiles(dir, base = dir, result = []) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.git' || entry.name === 'nodules' || entry.name === 'dist' || entry.name === 'node_modules') continue
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) await collectFiles(absolute, base, result)
    else if ((await stat(absolute)).isFile()) {
      const rel = relative(base, absolute).split('\\').join('/')
      if (Buffer.byteLength(rel) > 100) continue
      result.push({ name: rel, bytes: await readFile(absolute) })
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
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
    output.push(...bytes.subarray(offset, offset + length))
    offset += length
  }
  appendLe32(output, crc32(bytes))
  appendLe32(output, bytes.length >>> 0)
  return Buffer.from(output)
}
function parseManifest(text) {
  const name = text.match(/\bname\s*:\s*"([^"]+)"/)?.[1] || ''
  const version = text.match(/\bversion\s*:\s*"([^"]+)"/)?.[1] || ''
  const entry = text.match(/\bentry\s*:\s*"([^"]+)"/)?.[1] || ''
  const dependencies = {}
  const depBlock = text.match(/\bdependencies\s*\{([\s\S]*?)\}/)
  if (depBlock) {
    for (const line of depBlock[1].split('\n')) {
      const m = line.match(/^\s*[A-Za-z0-9_-]+\s*:\s*"([a-z0-9-]+\/[a-z0-9-]+)@([^"]+)"/)
      if (m) dependencies[m[1]] = m[2]
    }
  }
  return { name, version, entry, dependencies }
}

const CATALOG = [
  ['noqeri-cli', 'noqeri', 'cli', 'https://github.com/EMN90909/noqeri-cli', 'Argument parsing, subcommands, registry tooling, and CLI helpers.'],
  ['noqeri-std-io', 'noqeri', 'std-io', 'https://github.com/EMN90909/noqeri-std-io', 'Pure-Noqeri binary cursors, ring buffers, LEB128 varints, and stream primitives.'],
  ['noqeri-fs', 'noqeri', 'fs', 'https://github.com/EMN90909/noqeri-fs', 'Safe relative paths, traversal checks, path manipulation, and in-memory VFS.'],
  ['noqeri-net', 'noqeri', 'net', 'https://github.com/EMN90909/noqeri-net', 'IPv4/CIDR matching, RFC hostname validation, and framed socket buffers.'],
  ['noqeri-http', 'noqeri', 'http', 'https://github.com/EMN90909/noqeri-http', 'HTTP/1.1 request parser, header CRLF guards, and parameterized route matcher.'],
  ['noqeri-json', 'noqeri', 'json', 'https://github.com/EMN90909/noqeri-json', 'RFC-8259 recursive JSON validator, tokenizer, key lookup, and integer parser.'],
  ['noqeri-crypto', 'noqeri', 'crypto', 'https://github.com/EMN90909/noqeri-crypto', 'FIPS 180-4 SHA-256, RFC-2104 HMAC-SHA256, constant-time compare, and PRNG.'],
  ['noqeri-sync', 'noqeri', 'sync', 'https://github.com/EMN90909/noqeri-sync', 'Lock-free SpinLock, Once, Semaphore, SeqLock, and RingQueue primitives.'],
  ['noqeri-regex', 'noqeri', 'regex', 'https://github.com/EMN90909/noqeri-regex', 'ReDoS-safe step-budgeted regex compiler and matcher for byte slices.'],
  ['noqeri-web', 'noqeri', 'web', 'https://github.com/EMN90909/noqeri-web', 'Hardened web security policies, rate limiters, HTML escaper, and origin checks.'],
  ['noqeri-sqlite', 'noqeri', 'sqlite', 'https://github.com/EMN90909/noqeri-sqlite', 'Pure-Noqeri SQLite header codec, query classifier, and indexed CRUD store.'],
  ['NoeSQL', 'noqeri', 'noesql', 'https://github.com/EMN90909/NoeSQL', 'Capability-verified NoeSQL query boundary, IR validator, and WAL engine.'],
  ['Noqeri-UI', 'noqeri', 'components', 'https://github.com/EMN90909/Noqeri-UI', 'Zero-JavaScript native Noqeri UI component library and security alerts.'],
]

const packages = []
const releases = []

for (const [repoDir, namespace, name, repository, description] of CATALOG) {
  const pkgRoot = resolve(workspaceRoot, repoDir)
  const manifestText = await readFile(join(pkgRoot, 'package.noqeri'), 'utf8')
  const meta = parseManifest(manifestText)
  if (meta.name !== `${namespace}/${name}`) {
    throw new Error(`Manifest mismatch in ${repoDir}: expected ${namespace}/${name}, got ${meta.name}`)
  }
  const entries = await collectFiles(pkgRoot)
  const tarParts = []
  for (const { name: entryName, bytes } of entries) {
    tarParts.push(header(entryName, bytes.length), bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512))
  }
  tarParts.push(Buffer.alloc(1024))
  const ndlBytes = gzipStored(Buffer.concat(tarParts))
  const archiveFileName = `noqeri-${name}-${meta.version}.ndl`
  const archiveRelPath = `distribution/${archiveFileName}`
  await writeFile(join(outDir, archiveFileName), ndlBytes)
  const integrity = 'sha256:' + createHash('sha256').update(ndlBytes).digest('hex')

  const relEntry = {
    version: meta.version,
    archive: archiveRelPath,
    archiveIntegrity: integrity,
    entry: meta.entry,
    ...(Object.keys(meta.dependencies).length > 0 ? { dependencies: meta.dependencies } : {}),
    downloads: 0,
    yanked: false,
  }
  packages.push({
    namespace,
    name,
    description,
    repository,
    versions: [relEntry],
  })
  releases.push({
    package: meta.name,
    version: meta.version,
    archive: archiveRelPath,
    archiveIntegrity: integrity,
    entry: meta.entry,
    dependencies: meta.dependencies,
    bytes: ndlBytes.byteLength,
  })
  console.log(`Packed ${archiveRelPath} (${ndlBytes.byteLength} bytes) ${integrity}`)
}

packages.sort((a, b) => `${a.namespace}/${a.name}`.localeCompare(`${b.namespace}/${b.name}`))

const indexJson = {
  protocol: 'v1',
  packageFormat: 'ndl-1',
  archiveExtension: '.ndl',
  generatedAt: '2026-11-23T00:00:00Z',
  packages,
}
await writeFile(resolve(registryRoot, 'registry/index.json'), JSON.stringify(indexJson, null, 2) + '\n')
await writeFile(resolve(registryRoot, 'registry/releases.json'), JSON.stringify({ schema: 1, releases }, null, 2) + '\n')
console.log(`Updated registry/index.json and registry/releases.json with ${packages.length} packages.`)
