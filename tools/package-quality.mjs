#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const args = process.argv.slice(2)
const value = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const root = resolve(value('root') || '.')
const strict = args.includes('--strict')
const outputPath = resolve(value('output') || join(root, 'build', 'package-quality.json'))
const compatibilityPath = resolve(value('compatibility') || join(root, 'build', 'compatibility-results.json'))
const index = JSON.parse(readFileSync(join(root, 'registry', 'index.json'), 'utf8'))
const quality = JSON.parse(readFileSync(join(root, 'registry', 'quality.json'), 'utf8'))
const releases = JSON.parse(readFileSync(join(root, 'compatibility', 'releases.json'), 'utf8')).supported_compilers || []
const validLevels = quality.levels || ['experimental', 'preview', 'stable', 'core']
const rank = new Map(validLevels.map((name, index) => [name, index]))

function walk(path) {
  if (!existsSync(path)) return []
  const result = []
  for (const name of readdirSync(path)) {
    const full = join(path, name)
    const info = statSync(full)
    if (info.isDirectory()) result.push(...walk(full))
    else if (info.isFile()) result.push(full)
  }
  return result
}
function parseField(text, name) { return new RegExp(`\\b${name}\\s*:\\s*"([^"]+)"`).exec(text)?.[1] || '' }
function stripComments(text) { return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '') }
function sourceMetrics(files) {
  let bytes = 0, codeLines = 0, exports = 0, externs = 0
  for (const file of files) {
    const raw = readFileSync(file, 'utf8'), code = stripComments(raw)
    bytes += Buffer.byteLength(raw)
    codeLines += code.split(/\r?\n/).filter(line => line.trim()).length
    exports += [...code.matchAll(/^\s*export\s+function\s+/gm)].length
    externs += [...code.matchAll(/^\s*extern\s+function\s+/gm)].length
  }
  return { bytes, codeLines, exports, externs }
}
function negativeEvidence(testFiles) {
  for (const file of testFiles) {
    const name = file.toLowerCase()
    if (/negative|invalid|error|reject|failure/.test(name)) return true
    const text = readFileSync(file, 'utf8').toLowerCase()
    if (/\binvalid\b|\breject\b|\berror\b|\bfail/.test(text)) return true
  }
  return false
}
function securityEvidence(dir, readme) {
  if (existsSync(join(dir, 'SECURITY.md'))) return true
  return /^#{1,6}\s+security\b/im.test(readme)
}

let compatibility = null
if (existsSync(compatibilityPath)) compatibility = JSON.parse(readFileSync(compatibilityPath, 'utf8'))
const compatibilityRows = Array.isArray(compatibility?.rows) ? compatibility.rows : []

const rows = []
for (const pkg of index.packages || []) {
  for (const version of pkg.versions || []) {
    const key = `${pkg.namespace}/${pkg.name}@${version.version}`
    const declaration = quality.packages?.[key] || {}
    const declaredLevel = typeof declaration === 'string' ? declaration : declaration.level || quality.default_level
    if (!rank.has(declaredLevel)) throw new Error(`invalid quality level for ${key}: ${declaredLevel}`)
    const dir = resolve(root, version.path)
    const manifestPath = join(dir, 'package.nqr')
    const manifest = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : ''
    const entry = parseField(manifest, 'entry')
    const sourceFiles = walk(join(dir, 'src')).filter(path => path.endsWith('.nqr'))
    const testFiles = walk(join(dir, 'tests')).filter(path => path.endsWith('.nqr'))
    const exampleFiles = walk(join(dir, 'examples')).filter(path => path.endsWith('.nqr'))
    const readmePath = join(dir, 'README.md')
    const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : ''
    const metrics = sourceMetrics(sourceFiles)
    const entryExists = Boolean(entry) && existsSync(join(dir, entry))
    const depthPassed = metrics.codeLines >= 20 && metrics.exports >= 5 && !(metrics.codeLines <= 12 || (metrics.bytes < 1200 && metrics.exports <= 4))
    const previewReady = depthPassed && entryExists && Boolean(readme) && testFiles.length > 0 && exampleFiles.length > 0
    const legacyExperimental = version.experimental === true
    const providerStub = legacyExperimental && metrics.externs > 0 && /capability|provider|declaration|host/i.test(`${pkg.description || ''}\n${readme}`)
    const negativeTests = negativeEvidence(testFiles)
    const securityNotes = securityEvidence(dir, readme)
    const compatForPackage = compatibilityRows.filter(row => row.package === `${pkg.namespace}/${pkg.name}` && row.package_version === version.version)
    const supportedVersions = new Set(releases.map(release => String(release.version)))
    const verifiedVersions = new Set(compatForPackage.filter(row => row.status === 'pass' && row.evidence_state === 'verified').map(row => String(row.compiler_version)))
    const compatibilityPassed = supportedVersions.size > 0 && [...supportedVersions].every(version => verifiedVersions.has(version))
    const stableReady = previewReady && !legacyExperimental && !providerStub && negativeTests && securityNotes && compatibilityPassed
    const metadata = typeof declaration === 'object' && declaration ? declaration : {}
    const coreReady = stableReady && Number(metadata.stable_release_cycles || 0) >= 2 && metadata.migration_policy === true && metadata.offline_install_verified === true && typeof metadata.maintainer === 'string' && metadata.maintainer.trim().length > 0
    const maximumLevel = coreReady ? 'core' : stableReady ? 'stable' : previewReady ? 'preview' : 'experimental'
    const violations = []
    if (rank.get(declaredLevel) > rank.get(maximumLevel)) violations.push(`declared ${declaredLevel} exceeds evidence-backed maximum ${maximumLevel}`)
    if ((declaredLevel === 'stable' || declaredLevel === 'core') && providerStub) violations.push('provider/capability stub cannot be stable')
    rows.push({
      package: `${pkg.namespace}/${pkg.name}`,
      version: version.version,
      declared_level: declaredLevel,
      maximum_evidence_level: maximumLevel,
      passed: violations.length === 0,
      evidence: {
        depth_passed: depthPassed,
        entry_exists: entryExists,
        tests: testFiles.length,
        examples: exampleFiles.length,
        negative_tests: negativeTests,
        security_notes: securityNotes,
        compatibility_verified_releases: [...verifiedVersions].sort(),
        compatibility_required_releases: [...supportedVersions].sort(),
        provider_stub: providerStub,
        legacy_experimental: legacyExperimental,
        stable_release_cycles: Number(metadata.stable_release_cycles || 0),
        migration_policy: metadata.migration_policy === true,
        offline_install_verified: metadata.offline_install_verified === true,
        maintainer_recorded: typeof metadata.maintainer === 'string' && metadata.maintainer.trim().length > 0,
        source: metrics
      },
      violations
    })
  }
}

const summary = {
  package_versions: rows.length,
  passed: rows.filter(row => row.passed).length,
  violations: rows.filter(row => !row.passed).length,
  declared: Object.fromEntries(validLevels.map(level => [level, rows.filter(row => row.declared_level === level).length])),
  maximum: Object.fromEntries(validLevels.map(level => [level, rows.filter(row => row.maximum_evidence_level === level).length]))
}
const report = {
  schema: 1,
  generated_at: new Date().toISOString(),
  policy: 'Declared package quality may be lower than evidence permits, never higher. Missing compatibility execution cannot satisfy stable/core.',
  compatibility_source: existsSync(compatibilityPath) ? compatibilityPath : null,
  summary,
  rows
}
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n')
console.log(`package quality: versions=${summary.package_versions} violations=${summary.violations}`)
for (const row of rows.filter(row => !row.passed)) console.log(`FAIL ${row.package}@${row.version}: ${row.violations.join('; ')}`)
console.log(`evidence -> ${outputPath}`)
if (strict && summary.violations > 0) process.exitCode = 1
