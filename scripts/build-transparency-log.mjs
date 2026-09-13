#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] || process.cwd())
const packagesRoot = join(root, 'packages')
const outputPath = join(root, 'transparency', 'checksums.txt')
const checkpointPath = join(root, 'transparency', 'checkpoint.json')

function compareText(a, b) { return a < b ? -1 : a > b ? 1 : 0 }
function normalizedRelative(base, file) { return relative(base, file).split(sep).join('/') }

async function filesUnder(base, directory = base, out = []) {
  const entries = await readdir(directory, { withFileTypes: true })
  entries.sort((a, b) => compareText(a.name, b.name))
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await filesUnder(base, path, out)
    else if (entry.isFile() && entry.name !== '.noqeri-integrity.json') out.push(path)
  }
  return out
}

function digestPackage(base, filesAndBytes) {
  const hash = createHash('sha256')
  for (const { path, bytes } of filesAndBytes.sort((a, b) => compareText(normalizedRelative(base, a.path), normalizedRelative(base, b.path)))) {
    hash.update(normalizedRelative(base, path))
    hash.update('\0')
    hash.update(bytes)
    hash.update('\0')
  }
  return `sha256:${hash.digest('hex')}`
}

function parsePackageManifest(text, fallbackCoordinate, fallbackVersion) {
  const name = text.match(/\bname\s*:\s*"([^"]+)"/)?.[1] || fallbackCoordinate
  const version = text.match(/\bversion\s*:\s*"([^"]+)"/)?.[1] || fallbackVersion
  const entry = text.match(/\bentry\s*:\s*"([^"]+)"/)?.[1] || ''
  if (!/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(name)) throw new Error(`invalid package coordinate: ${name}`)
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`invalid package version: ${name}@${version}`)
  if (!entry || entry.startsWith('/') || entry.includes('..') || entry.includes('\\')) throw new Error(`unsafe package entry: ${name}@${version}`)
  return { name, version, entry }
}

async function packageVersions() {
  const records = []
  for (const namespaceEntry of (await readdir(packagesRoot, { withFileTypes: true })).filter(entry => entry.isDirectory()).sort((a,b)=>compareText(a.name,b.name))) {
    const namespacePath = join(packagesRoot, namespaceEntry.name)
    for (const packageEntry of (await readdir(namespacePath, { withFileTypes: true })).filter(entry => entry.isDirectory()).sort((a,b)=>compareText(a.name,b.name))) {
      const packagePath = join(namespacePath, packageEntry.name)
      for (const versionEntry of (await readdir(packagePath, { withFileTypes: true })).filter(entry => entry.isDirectory()).sort((a,b)=>compareText(a.name,b.name))) {
        const versionPath = join(packagePath, versionEntry.name)
        const manifestPath = join(versionPath, 'package.nqr')
        let manifestText
        try { manifestText = await readFile(manifestPath, 'utf8') } catch { continue }
        const manifest = parsePackageManifest(manifestText, `${namespaceEntry.name}/${packageEntry.name}`, versionEntry.name)
        const files = await filesUnder(versionPath)
        if (!files.some(file => normalizedRelative(versionPath, file) === manifest.entry)) throw new Error(`entry not found: ${manifest.name}@${manifest.version} -> ${manifest.entry}`)
        const bytes = await Promise.all(files.map(async path => ({ path, bytes: await readFile(path) })))
        records.push({ coordinate: manifest.name, version: manifest.version, integrity: digestPackage(versionPath, bytes), entry: manifest.entry, files: files.length })
      }
    }
  }
  return records.sort((a,b)=>compareText(`${a.coordinate}@${a.version}`,`${b.coordinate}@${b.version}`))
}

const records = await packageVersions()
const body = records.map(record => `${record.coordinate} ${record.version} ${record.integrity} ${record.entry}`).join('\n') + '\n'
const checkpointHash = createHash('sha256').update(body).digest('hex')
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, body)
await writeFile(checkpointPath, JSON.stringify({ format: 'noqeri-sum-v1', records: records.length, sha256: checkpointHash }, null, 2) + '\n')
console.log(`transparency log: ${records.length} records`)
console.log(`checkpoint sha256:${checkpointHash}`)
