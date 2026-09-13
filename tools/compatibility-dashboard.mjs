#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.argv[2] || '.')
const packageRoot = join(root, 'packages')
const releases = JSON.parse(readFileSync(join(root, 'compatibility', 'releases.json'), 'utf8')).supported_compilers || []
const rows = []

function dirs(path) {
  if (!existsSync(path)) return []
  return readdirSync(path).filter(name => {
    try { return statSync(join(path, name)).isDirectory() } catch { return false }
  })
}

for (const namespace of dirs(packageRoot)) {
  for (const name of dirs(join(packageRoot, namespace))) {
    for (const version of dirs(join(packageRoot, namespace, name))) {
      const dir = join(packageRoot, namespace, name, version)
      const manifest = join(dir, 'package.nqr')
      const hasTests = existsSync(join(dir, 'tests')) && dirs(join(dir, 'tests')).length + readdirSync(join(dir, 'tests')).filter(x => x.endsWith('.nqr')).length > 0
      const hasExamples = existsSync(join(dir, 'examples'))
      for (const compiler of releases) {
        rows.push({
          package: `${namespace}/${name}`,
          package_version: version,
          compiler_version: compiler.version,
          edition: compiler.edition,
          manifest: existsSync(manifest),
          tests_present: hasTests,
          examples_present: hasExamples,
          status: 'untested'
        })
      }
    }
  }
}

const output = { schema: 1, generated_at: new Date().toISOString(), rows }
const destination = resolve(process.argv[3] || join(root, 'build', 'compatibility-dashboard.json'))
mkdirSync(resolve(destination, '..'), { recursive: true })
writeFileSync(destination, JSON.stringify(output, null, 2) + '\n')
console.log(`compatibility dashboard inventory: ${rows.length} package/compiler pairs -> ${destination}`)
