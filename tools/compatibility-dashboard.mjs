#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(process.argv[2] || '.')
const destination = resolve(process.argv[3] || join(root, 'build', 'compatibility-dashboard.json'))
const resultPath = resolve(process.argv[4] || join(root, 'build', 'compatibility-results.json'))
const packageRoot = join(root, 'packages')
const releases = JSON.parse(readFileSync(join(root, 'compatibility', 'releases.json'), 'utf8')).supported_compilers || []
const rows = []

function dirs(path) {
  if (!existsSync(path)) return []
  return readdirSync(path).filter(name => {
    try { return statSync(join(path, name)).isDirectory() } catch { return false }
  }).sort()
}

const executed = new Map()
let executionGeneratedAt = null
if (existsSync(resultPath)) {
  const data = JSON.parse(readFileSync(resultPath, 'utf8'))
  executionGeneratedAt = data.generated_at || null
  for (const row of data.rows || []) {
    executed.set(`${row.package}@${row.package_version}|${row.compiler_version}`, row)
  }
}

for (const namespace of dirs(packageRoot)) {
  for (const name of dirs(join(packageRoot, namespace))) {
    for (const version of dirs(join(packageRoot, namespace, name))) {
      const dir = join(packageRoot, namespace, name, version)
      const manifest = join(dir, 'package.nqr')
      const testDir = join(dir, 'tests')
      const hasTests = existsSync(testDir) && readdirSync(testDir).some(x => x.endsWith('.nqr'))
      const hasExamples = existsSync(join(dir, 'examples'))
      for (const compiler of releases) {
        const coordinate = `${namespace}/${name}`
        const key = `${coordinate}@${version}|${compiler.version}`
        const evidence = executed.get(key)
        rows.push({
          package: coordinate,
          package_version: version,
          compiler_version: compiler.version,
          edition: compiler.edition,
          manifest: existsSync(manifest),
          tests_present: hasTests,
          examples_present: hasExamples,
          status: evidence?.status || 'untested',
          evidence_state: evidence?.evidence_state || (hasTests ? 'test-contract' : 'implemented'),
          duration_ms: evidence?.result?.duration_ms ?? null,
          evidence_available: Boolean(evidence)
        })
      }
    }
  }
}

const summary = rows.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc }, {})
const output = {
  schema: 2,
  generated_at: new Date().toISOString(),
  execution_evidence: existsSync(resultPath) ? resultPath : null,
  execution_generated_at: executionGeneratedAt,
  summary,
  rows
}
mkdirSync(dirname(destination), { recursive: true })
writeFileSync(destination, JSON.stringify(output, null, 2) + '\n')
console.log(`compatibility dashboard: ${rows.length} package/compiler pairs; pass=${summary.pass || 0} failed=${summary.failed || 0} untested=${summary.untested || 0} unavailable=${summary.unavailable || 0} -> ${destination}`)
