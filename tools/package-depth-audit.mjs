#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd(), 'packages');
const argv = process.argv.slice(2);
const jsonOnly = argv.includes('--json');
const strict = argv.includes('--strict');
const minCodeLines = readNumber('--min-code-lines', 20);
const minExports = readNumber('--min-exports', 5);
const requestedBytes = readNumber('--requested-bytes', 30 * 1024);

function readNumber(flag, fallback) {
  const index = argv.indexOf(flag);
  if (index < 0 || index + 1 >= argv.length) return fallback;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

function packageRoots() {
  return walk(root)
    .filter((file) => path.basename(file) === 'package.nqr')
    .map((file) => path.dirname(file))
    .sort();
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function parseField(manifest, name) {
  const match = manifest.match(new RegExp(`\\b${name}\\s*:\\s*"([^"]+)"`));
  return match ? match[1] : '';
}

function codeMetrics(files) {
  let bytes = 0;
  let codeLines = 0;
  let exports = 0;
  let records = 0;
  let functions = 0;
  let loops = 0;
  let branches = 0;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const code = stripComments(source);
    bytes += Buffer.byteLength(source, 'utf8');
    codeLines += code.split(/\r?\n/).filter((line) => line.trim()).length;
    exports += count(code, /^\s*export\s+function\s+[A-Za-z_][A-Za-z0-9_]*/gm);
    records += count(code, /^\s*record\s+[A-Za-z_][A-Za-z0-9_]*/gm);
    functions += count(code, /^\s*function\s+[A-Za-z_][A-Za-z0-9_]*/gm);
    loops += count(code, /\bwhile\b/gm);
    branches += count(code, /\bif\b/gm);
  }
  return { bytes, codeLines, exports, records, functions, loops, branches };
}

function auditPackage(directory) {
  const manifestPath = path.join(directory, 'package.nqr');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const sourceFiles = walk(path.join(directory, 'src')).filter((file) => file.endsWith('.nqr'));
  const testFiles = walk(path.join(directory, 'tests')).filter((file) => file.endsWith('.nqr'));
  const exampleFiles = walk(path.join(directory, 'examples')).filter((file) => file.endsWith('.nqr'));
  const readme = fs.existsSync(path.join(directory, 'README.md'));
  const metrics = codeMetrics(sourceFiles);
  const packageName = parseField(manifest, 'name') || path.relative(root, directory).replaceAll(path.sep, '/');
  const version = parseField(manifest, 'version');
  const license = parseField(manifest, 'license');
  const entry = parseField(manifest, 'entry');
  const entryExists = entry ? fs.existsSync(path.join(directory, entry)) : false;
  const obviousPlaceholder = metrics.codeLines <= 12 ||
    (metrics.bytes < 1200 && metrics.exports <= 4 && metrics.records === 0 && metrics.functions <= 4);
  const depthPassed = !obviousPlaceholder && metrics.codeLines >= minCodeLines && metrics.exports >= minExports;
  const hasTests = testFiles.length > 0;
  const hasExamples = exampleFiles.length > 0;
  const licenseOk = license === 'GPL-3.0-only';

  let tier = 'developing';
  if (obviousPlaceholder) tier = 'placeholder';
  else if (depthPassed && hasTests && hasExamples && readme && entryExists && licenseOk) tier = 'reviewable';

  return {
    package: packageName,
    version,
    directory: path.relative(process.cwd(), directory).replaceAll(path.sep, '/'),
    entry,
    entryExists,
    license,
    licenseOk,
    sourceFiles: sourceFiles.length,
    testFiles: testFiles.length,
    exampleFiles: exampleFiles.length,
    readme,
    ...metrics,
    obviousPlaceholder,
    depthPassed,
    requestedByteTarget: metrics.bytes >= requestedBytes,
    tier,
  };
}

function summarize(packages) {
  const tiers = { placeholder: 0, developing: 0, reviewable: 0 };
  for (const pkg of packages) tiers[pkg.tier] += 1;
  return {
    packageVersions: packages.length,
    tiers,
    placeholders: tiers.placeholder,
    reviewable: tiers.reviewable,
    withTests: packages.filter((pkg) => pkg.testFiles > 0).length,
    withExamples: packages.filter((pkg) => pkg.exampleFiles > 0).length,
    gpl3Only: packages.filter((pkg) => pkg.licenseOk).length,
    requestedByteTargetCount: packages.filter((pkg) => pkg.requestedByteTarget).length,
  };
}

function pad(value, width, right = true) {
  const text = String(value);
  return right ? text.padStart(width) : text.padEnd(width);
}

if (!fs.existsSync(root)) {
  console.error(`packages directory not found: ${root}`);
  process.exit(2);
}

const packages = packageRoots().map(auditPackage);
packages.sort((left, right) => {
  const order = { placeholder: 0, developing: 1, reviewable: 2 };
  const tier = order[left.tier] - order[right.tier];
  if (tier !== 0) return tier;
  if (left.codeLines !== right.codeLines) return left.codeLines - right.codeLines;
  return `${left.package}@${left.version}`.localeCompare(`${right.package}@${right.version}`);
});

const summary = summarize(packages);
const report = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  policy: {
    minCodeLines,
    minExports,
    requestedBytes,
    note: 'The byte target is reported for transparency. It cannot upgrade placeholder code by itself.'
  },
  summary,
  packages,
};

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('Noqeri registry package-depth audit');
  console.log(`versions=${summary.packageVersions} placeholders=${summary.placeholders} reviewable=${summary.reviewable} tests=${summary.withTests} examples=${summary.withExamples}`);
  console.log('');
  console.log(`${pad('package@version', 36, false)} ${pad('bytes', 8)} ${pad('code', 6)} ${pad('api', 5)} ${pad('tests', 5)} ${pad('examples', 8)} ${pad('tier', 12, false)}`);
  console.log('-'.repeat(86));
  for (const pkg of packages) {
    const label = `${pkg.package}@${pkg.version}`;
    console.log(`${pad(label, 36, false)} ${pad(pkg.bytes, 8)} ${pad(pkg.codeLines, 6)} ${pad(pkg.exports, 5)} ${pad(pkg.testFiles, 5)} ${pad(pkg.exampleFiles, 8)} ${pad(pkg.tier, 12, false)}`);
  }
  console.log('');
  console.log('reviewable requires real source depth + tests + examples + README + entry + GPL-3.0-only.');
  console.log('30 KiB is informational only; repetition/comments cannot convert a placeholder into reviewable code.');
}

if (strict && summary.placeholders > 0) process.exit(1);
