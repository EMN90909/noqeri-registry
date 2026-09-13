#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] || '.')
const packagesRoot = join(root, 'packages')
const indexPath = join(root, 'registry', 'index.json')
const checksumPath = join(root, 'registry', 'checksums.json')

function order(a, b) { return a < b ? -1 : a > b ? 1 : 0 }

async function filesUnder(rootDir, dir = rootDir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  entries.sort((a, b) => order(a.name, b.name))
  for (const entry of entries) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) await filesUnder(rootDir, absolute, out)
    else if (entry.isFile()) {
      const name = relative(rootDir, absolute).split(sep).join('/')
      out.push({ name, bytes: new Uint8Array(await readFile(absolute)) })
    } else {
      throw new Error(`unsupported registry entry: ${absolute}`)
    }
  }
  return out
}

function digest(files) {
  const hash = createHash('sha256')
  let bytes = 0
  for (const file of [...files].sort((a, b) => order(a.name, b.name))) {
    hash.update(file.name)
    hash.update('\0')
    hash.update(file.bytes)
    hash.update('\0')
    bytes += file.bytes.byteLength
  }
  return { integrity: `sha256:${hash.digest('hex')}`, files: files.length, bytes }
}

const index = JSON.parse(await readFile(indexPath, 'utf8'))
const checksums = { protocol: 'noqeri-sum-v1', generatedFrom: 'registry/index.json', packages: [] }

for (const pkg of index.packages || []) {
  for (const release of pkg.versions || []) {
    const directory = join(root, release.path)
    const info = await stat(directory)
    if (!info.isDirectory()) throw new Error(`release path is not a directory: ${release.path}`)
    const calculated = digest(await filesUnder(directory))
    release.integrity = calculated.integrity
    release.files = calculated.files
    release.bytes = calculated.bytes
    checksums.packages.push({ coordinate: `${pkg.namespace}/${pkg.name}`, version: release.version, ...calculated })
  }
}

index.packages.sort((a, b) => order(`${a.namespace}/${a.name}`, `${b.namespace}/${b.name}`))
for (const pkg of index.packages) pkg.versions.sort((a, b) => order(a.version, b.version))
checksums.packages.sort((a, b) => order(`${a.coordinate}@${a.version}`, `${b.coordinate}@${b.version}`))

await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`)
await writeFile(checksumPath, `${JSON.stringify(checksums, null, 2)}\n`)
console.log(`wrote ${index.packages.length} package records and ${checksums.packages.length} checksums`)
