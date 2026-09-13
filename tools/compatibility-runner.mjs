#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function usage() {
  console.log(`Noqeri registry compatibility runner\n\nUsage:\n  node tools/compatibility-runner.mjs [root] [output] [options]\n\nOptions:\n  --compiler=<version>:<path>  compiler binary for a supported version (repeatable)\n  --require-all                fail if any supported compiler is unavailable\n  --timeout-ms=<n>             per package test timeout (default 60000)\n\nCompiler paths can also be supplied with environment variables such as\nNOQERI_COMPILER_1_0_0=/opt/noqeri-1.0.0/bin/noqeri.\n`)
}

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0) }
const positional = args.filter(x => !x.startsWith('--'))
const root = resolve(positional[0] || '.')
const outputPath = resolve(positional[1] || join(root, 'build', 'compatibility-results.json'))
const requireAll = args.includes('--require-all')
const timeoutArg = args.find(x => x.startsWith('--timeout-ms='))
const timeoutMs = timeoutArg ? Math.max(1000, Number(timeoutArg.slice('--timeout-ms='.length)) || 60000) : 60000
const overrides = new Map()
for (const arg of args.filter(x => x.startsWith('--compiler='))) {
  const value = arg.slice('--compiler='.length)
  const split = value.indexOf(':')
  if (split <= 0 || split === value.length - 1) throw new Error(`invalid compiler mapping: ${value}`)
  overrides.set(value.slice(0, split), resolve(value.slice(split + 1)))
}

function dirs(path) {
  if (!existsSync(path)) return []
  return readdirSync(path).filter(name => {
    try { return statSync(join(path, name)).isDirectory() } catch { return false }
  }).sort()
}
function files(path, suffix) {
  if (!existsSync(path)) return []
  return readdirSync(path).filter(name => {
    try { return statSync(join(path, name)).isFile() && (!suffix || name.endsWith(suffix)) } catch { return false }
  }).sort()
}
function envKey(version) { return `NOQERI_COMPILER_${version.replace(/[^A-Za-z0-9]/g, '_')}` }
function tail(text, max = 4000) {
  const value = String(text || '')
  return value.length <= max ? value : value.slice(value.length - max)
}
function parseEntry(manifestText) {
  return /\bentry\s*:\s*"([^"]+)"/.exec(manifestText)?.[1] || null
}
function run(binary, argv, cwd) {
  const started = process.hrtime.bigint()
  const result = spawnSync(binary, argv, { cwd, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 4 * 1024 * 1024 })
  const elapsed = Number(process.hrtime.bigint() - started) / 1e6
  return {
    status: result.status,
    signal: result.signal || null,
    error: result.error?.message || null,
    duration_ms: Math.round(elapsed * 1000) / 1000,
    stdout_tail: tail(result.stdout),
    stderr_tail: tail(result.stderr)
  }
}

const releasePath = join(root, 'compatibility', 'releases.json')
const releaseData = JSON.parse(readFileSync(releasePath, 'utf8'))
const releases = Array.isArray(releaseData.supported_compilers) ? releaseData.supported_compilers : []
if (!releases.length) throw new Error('compatibility/releases.json has no supported_compilers')

const packages = []
const packageRoot = join(root, 'packages')
for (const namespace of dirs(packageRoot)) {
  for (const name of dirs(join(packageRoot, namespace))) {
    for (const version of dirs(join(packageRoot, namespace, name))) {
      const dir = join(packageRoot, namespace, name, version)
      const manifestPath = join(dir, 'package.nqr')
      let entry = null
      if (existsSync(manifestPath)) entry = parseEntry(readFileSync(manifestPath, 'utf8'))
      const testFiles = files(join(dir, 'tests'), '.nqr')
      packages.push({ coordinate: `${namespace}/${name}`, version, dir, manifestPath, entry, testFiles })
    }
  }
}

const compilerState = new Map()
for (const release of releases) {
  const version = String(release.version)
  const configured = overrides.get(version) || process.env[envKey(version)] || ''
  if (!configured) {
    compilerState.set(version, { available: false, binary: null, reason: `set ${envKey(version)} or --compiler=${version}:<path>` })
    continue
  }
  const binary = resolve(configured)
  if (!existsSync(binary)) {
    compilerState.set(version, { available: false, binary, reason: 'configured compiler path does not exist' })
    continue
  }
  const probe = run(binary, ['--version'], root)
  if (probe.error || probe.status !== 0) {
    compilerState.set(version, { available: false, binary, reason: probe.error || `--version exited ${probe.status}`, probe })
    continue
  }
  const combined = `${probe.stdout_tail}\n${probe.stderr_tail}`
  const versionMatch = combined.includes(version)
  compilerState.set(version, { available: true, binary, version_match: versionMatch, probe })
}

const rows = []
for (const pkg of packages) {
  for (const release of releases) {
    const compilerVersion = String(release.version)
    const compiler = compilerState.get(compilerVersion)
    const base = {
      package: pkg.coordinate,
      package_version: pkg.version,
      compiler_version: compilerVersion,
      edition: release.edition,
      target: release.target || null,
      compiler_binary: compiler?.binary || null,
      manifest: existsSync(pkg.manifestPath),
      tests_present: pkg.testFiles.length > 0,
      entry: pkg.entry,
      evidence_state: pkg.testFiles.length > 0 ? 'test-contract' : 'implemented'
    }
    if (!compiler?.available) {
      rows.push({ ...base, status: 'unavailable', reason: compiler?.reason || 'compiler unavailable' })
      continue
    }
    if (compiler.version_match === false) {
      rows.push({ ...base, status: 'failed', reason: `compiler --version did not contain expected ${compilerVersion}`, probe: compiler.probe })
      continue
    }
    if (!base.manifest || !pkg.entry) {
      rows.push({ ...base, status: 'failed', reason: 'package manifest or entry is missing' })
      continue
    }
    const entryPath = join(pkg.dir, pkg.entry)
    if (!existsSync(entryPath)) {
      rows.push({ ...base, status: 'failed', reason: `manifest entry does not exist: ${pkg.entry}` })
      continue
    }
    const command = pkg.testFiles.length ? ['test', 'tests'] : ['check', pkg.entry]
    const result = run(compiler.binary, command, pkg.dir)
    const passed = !result.error && result.status === 0
    rows.push({
      ...base,
      status: passed ? 'pass' : 'failed',
      evidence_state: passed ? 'verified' : base.evidence_state,
      command: [relative(root, compiler.binary) || compiler.binary, ...command],
      result
    })
  }
}

const summary = rows.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc }, {})
const output = {
  schema: 1,
  generated_at: new Date().toISOString(),
  registry_root: root,
  release_policy: relative(root, releasePath),
  timeout_ms: timeoutMs,
  require_all: requireAll,
  compilers: Object.fromEntries(compilerState),
  summary,
  rows
}
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n')
console.log(`compatibility execution: ${rows.length} pairs; pass=${summary.pass || 0} failed=${summary.failed || 0} unavailable=${summary.unavailable || 0}`)
console.log(`evidence -> ${outputPath}`)

if ((summary.failed || 0) > 0 || (requireAll && (summary.unavailable || 0) > 0)) process.exitCode = 1
