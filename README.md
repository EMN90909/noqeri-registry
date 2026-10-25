<p align="center">
  <a href="https://github.com/EMN90909/Noqeri">
    <img src="https://raw.githubusercontent.com/EMN90909/Noqeri/main/Brand/noqeri-logo.webp" alt="Noqeri" width="170">
  </a>
</p>

<h1 align="center">Noqeri Registry</h1>

<p align="center">
  <strong>The package catalog and experimental Registry API for the Noqeri language.</strong><br>
  Versioned libraries · Reproducible archives · Integrity-checked downloads
</p>

<p align="center">
  <a href="package.json"><img alt="Service version 0.1.0" src="https://img.shields.io/badge/service-0.1.0-2563EB"></a>
  <a href="registry/PROTOCOL.md"><img alt="Registry API v1" src="https://img.shields.io/badge/API-v1-0F766E"></a>
  <a href="registry/QUALITY.md"><img alt="Experimental packages" src="https://img.shields.io/badge/quality-experimental-D97706"></a>
  <a href="LICENSE"><img alt="GPL-3.0-only" src="https://img.shields.io/badge/license-GPL--3.0--only-64748B"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#package-catalog">Packages</a> ·
  <a href="#http-api">HTTP API</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#testing-and-qualification">Tests</a>
</p>

---

**Noqeri Registry** hosts the official source catalog for [Noqeri](https://github.com/EMN90909/Noqeri) packages and an **experimental, read-only Registry HTTP API v1**. It contains historical library releases, deterministic `.nqpkg` archive tooling, a one-time catalog importer, metadata/advisory endpoints, quality policies and compatibility tests.

**Current state:** The existing NoeSQL-backed production-style HTTP path remains a **Node.js 22** transport. A separate **Noqeri Stage-0 AOT + C++ POSIX native preview** is now available without any JavaScript runtime. It is explicitly source-index-backed and **not yet native NoeSQL qualified**. See [native preview](docs/NATIVE_PREVIEW.md). The legacy Node service loads metadata through an **external NoeSQL session**. The Noqeri-native application and its native host ABI are present as source but **not yet end-to-end qualified**. There is **no public package publishing API**, no production deployment guarantee and no verified stable package channel.

## At a glance

| Component | Implemented today | Qualification boundary |
| :--- | :--- | :--- |
| Package catalog | `registry/index.json` and versioned `packages/` source tree | Historical source includes the legacy `.noqeri` extension |
| HTTP API | `GET` / `HEAD` metadata, search, advisories, and download routes | Node transport; experimental deployment |
| Native Noqeri preview | Stage-0 compiled Noqeri routing plus C++ Linux HTTP/archives without a JavaScript runtime | Explicit source-index mode only; native NoeSQL integration pending |
| Metadata storage | NoeSQL-backed `registry.noedb` and explicit one-time import | Requires a separately installed NoeSQL session |
| Package archives | Deterministic tar.gz `.nqpkg` with SHA-256 integrity and input limits | Existing releases are not proof of native Stage-2 compatibility |
| Native application | `Programs/registry.noqeri` and `src/registry.noqeri` | `registryHostServe` native binding is not qualified |
| Quality and compatibility | Policy, checkers, test fixtures and release evidence tooling | Default quality is **experimental**, not stable |

## Compiler downloads for Windows, Linux, macOS, Android, BSD and custom targets

The registry now includes a [responsive compiler download page](downloads/index.html), a [read-only release catalog](downloads/releases.json), and a [SHA-256 verifying installer](scripts/install_noqeri.py). Both the Noqeri-native preview server and the existing HTTP transport serve `GET /downloads` and `GET /v1/releases`.

Release manifests describe a **real compiled binary**, CPU architecture, OS, optional qualified GPU architecture, archive format, SHA-256 and target execution evidence. The compiler-side distribution tool builds raw binary, .gz, .tar, .tar.gz and .zip formats. Published GitHub Release assets are imported **only after downloading and verifying their complete SHA-256 bytes**. No fabricated binary links are shown: the public catalog starts empty until an official compiler release is uploaded and synchronized.

See [compiler distribution, release workflow and installation guide](docs/COMPILER_DOWNLOADS.md). The registry remains experimental and native NoeSQL production parity is independent of this compiler download feature.

## Native Noqeri executable (experimental)

The repository now includes a Linux x86-64 **Noqeri-compiled** read-only registry program. Route matching and protocol guards live in `src/registry.noqeri`. C++ supplies the operating-system socket, archive and JSON boundaries. It requires **no JavaScript runtime**, but the **source-index preview is not yet connected to native NoeSQL**. The older JavaScript server is retained for its currently functioning NoeSQL-backed session until native parity has been verified.

```sh
NOQERI_COMPILER=/path/to/noqeri make native
REGISTRY_SOURCE_INDEX_PREVIEW=1 REGISTRY_ROOT="$PWD" ./build/native/noqeri-registry
```

See [native build, security boundaries and tests](docs/NATIVE_PREVIEW.md).

## Quick start

### 1. Run public tests (no private database required)

Requires **Node.js 22.13.0+** and Git. The `package.json` scripts use Node's built-in test runner and declare no npm dependencies.

```sh
git clone https://github.com/EMN90909/noqeri-registry.git
cd noqeri-registry

npm test
node scripts/verify-index.mjs
```

`npm test` runs the public archive, semantic-versioning and HTTP transport contract suites. The transport tests use an injected catalog fixture, **not** a real NoeSQL database. `verify-index.mjs` checks the committed catalog structure and package-version references; it does not compile every package.

### 2. Start a local Registry API (requires NoeSQL)

The actual service needs an **authorized, separately installed NoeSQL session module**. NoeSQL code is not bundled in this repository. Set `NOESQL_SESSION_MODULE` to the absolute path of a suitable `.mjs` module exposing `database()`.

```sh
# Linux / macOS
export NOESQL_SESSION_MODULE=/absolute/path/to/NoeSQL/Runtime/noesql-session.mjs

# One-time import into an EMPTY registry.noedb; creates artifacts/
npm run bootstrap

# Starts the read-only HTTP server (default port 8080)
npm start
```

PowerShell uses `$env:NOESQL_SESSION_MODULE = "C:\absolute\path\to\NoeSQL\Runtime
oesql-session.mjs"`.

The service reads `PORT` (default `8080`) and listens on `0.0.0.0` by default; use a trusted local environment and secure network isolation for experiments. **Do not run the importer against an existing database.** The importer deliberately rejects initialized package metadata, and partial imports require operator recovery. Back up both metadata and artifacts before any manual changes.

On another terminal, after successfully bootstrapping and starting the service:

```sh
curl http://localhost:8080/health
curl http://localhost:8080/v1/status
curl "http://localhost:8080/v1/search?q=core"
curl http://localhost:8080/v1/packages/noqeri/core/versions
```

If NoeSQL is not installed, start with the **public tests** above; `npm start` is not a stand-alone demo server that silently substitutes a mock database.

## Package catalog

**Catalog snapshot on October 25, 2026:** `registry/index.json` contains **55 package coordinates** and **170 version entries**.

| Release family | Catalog entries | Notes |
| :--- | ---: | :--- |
| `0.1.0` | 55 | 54 canonical `.noqeri` library migrations and one PGAS release |
| `0.4.0` | 54 | Preserved, non-yanked historical `.noqeri` library releases |
| `0.1.3`, `0.1.4` | 2 | Later experimental `noqeri/pgas` releases |
| Historical `1.0.0`, `1.5.0`, `1.6.0` | 59 | Retained on disk but **yanked** in the catalog |
| **Total** | **170** | **111 non-yanked**, 59 yanked |

Examples of package areas include foundations (`core`, `std`, `test`), encoding (`base64`, `json`, `yaml`), web/networking (`http`, `websocket`), data (`db`, `sqlite`, `postgres`), and experimental provider adapters (`supabase`, `stripe`, `openai`). These names are **catalog entries**, not promises that every adapter has live provider support or complete compiler compatibility.

Explore the [catalog](registry/index.json), [source packages](packages/noqeri) and [provider-package limits](docs/PROVIDER_PACKAGES.md).

### Canonical `0.1.0` library release migration

All 54 library packages now have separate `0.1.0` release trees with `package.noqeri`, `.noqeri` sources, tests and examples, and corrected relative imports. `noqeri/pgas@0.1.0` already used canonical source extensions. Run `python3 scripts/migrate_canonical.py --check` to verify package identities, entry files and source references without rewriting anything. The one-time `--write` operation can regenerate the release set from the immutable `0.4.0` trees in an earlier checkout.

**SemVer migration caveat:** `0.4.0` sorts after `0.1.0` and remains non-yanked to avoid breaking existing downloads. To select the canonical migration, pin `@0.1.0` explicitly. This is a source-format migration, **not** evidence of native compiler parity or live provider integration. The Node.js transport remains the working HTTP host until the Noqeri native host ABI and NoeSQL runtime are qualified.

### Canonical extensions and release immutability

| File | Meaning |
| :--- | :--- |
| `.noqeri` | Current Noqeri source |
| `.noqerii` | Portable Noqeri compiled bytecode, produced by the language toolchain |
| `.nqrin` | Noqeri Object Notation, including `project.nqrin` |
| `.nqpkg` | Deterministic, SHA-256-addressed package archive |
| `.noedb` | NoeSQL metadata database file |
| `.noqeri` / `.nqri` | Legacy language/bytecode names; **not** canonical for new releases |

**Breaking change:** Historical package source files have been renamed to `.noqeri`. No compatibility mode for former extensions is supported. The repository still contains legacy `package.noqeri` and `src/*.noqeri` contents in versioned directories. Altering those files changes package bytes and breaks reproducibility or pinned consumers. New versions should use `package.noqeri` and `.noqeri` source, with migration and compiler-compatibility evidence.

The `noqeri/pgas` packages demonstrate the current `.noqeri` layout: [PGAS 0.1.4 manifest](packages/noqeri/pgas/0.1.4/package.noqeri). Older package trees are archival compatibility surfaces, not automatically rewritten sources.

### Package quality is evidence-based

The registry currently defaults to **`experimental`**. A published source file or test fixture is not equivalent to verified runtime compatibility.

| Level | Meaning |
| :--- | :--- |
| **Experimental** | Early or provider-dependent, without a compatibility promise |
| **Preview** | Substantive implementation with tests, examples and documented bounds |
| **Stable** | Executed compatibility, negative/security tests, versioning guarantees and relevant evidence |
| **Core** | Stable requirements plus sustained maintenance, migration and offline-install proof |

Quality is defined by [`registry/quality.json`](registry/quality.json) and [quality policy](registry/QUALITY.md); the current per-release overrides map is empty. To evaluate promotion candidates, use `node tools/package-quality.mjs` and the [compatibility tooling](compatibility/README.md). No package should be presented as stable simply because its historical version is `1.0.0`.

## HTTP API

The server implements these **read-only** HTTP routes (`GET` and `HEAD`):

| Route | Response |
| :--- | :--- |
| `/health` | Basic service health and NoeSQL storage identifier |
| `/v1/status` | Experimental capability status, including disabled publishing |
| `/v1/index` | Protocol, archive format and complete catalog |
| `/v1/packages` | Package list |
| `/v1/search?q=core&limit=50&offset=0` | Substring search with bounded pagination |
| `/v1/packages/noqeri/core` | Package details |
| `/v1/packages/noqeri/core/versions` | Version metadata |
| `/v1/packages/noqeri/core/0.4.0` | One version's metadata, including SHA-256 digest |
| `/v1/packages/noqeri/core/0.4.0/download` | Verified `.nqpkg` bytes if the version is not yanked |
| `/v1/advisories` | Non-withdrawn advisories in the database |

Downloads use `application/vnd.noqeri.package+gzip` and an `X-Archive-SHA256` response header. The server reads, hashes and checks the archive against the stored digest before returning it. Clients **must independently verify** the expected SHA-256 digest of the downloaded archive and apply safe extraction limits.

**Yanked versions:** Automatic selection does not include yanked releases; this server also returns an error for **explicit online download** of a yanked release. A previously verified local offline cache is a separate client-side policy. There is no unauthenticated `POST /publish` or authenticated publishing workflow exposed by this HTTP API.

Read the full [Registry v1 protocol](registry/PROTOCOL.md) and [archive specification](registry/PACKAGE_FORMAT.md).

## Architecture

```text
                    Noqeri Registry
                           │
         ┌─────────────────┴────────────────┐
         │                                  │
    Noqeri sources                    Node.js 22 host
    Programs/registry.noqeri          runtime/server.mjs
    src/registry.noqeri                     │
         │                           runtime/catalog.mjs
   registryHostServe                       │
    (not qualified)                   NoeSQL session
                                            │
                                     registry.noedb
                                      (metadata)
                                            │
                                  artifacts/sha256-*.nqpkg
                                    (archive bytes)
```

`registry/index.json` is the **one-time import source**, not the authoritative live catalog once the service has bootstrapped. `runtime/catalog.mjs` queries the NoeSQL database, while `runtime/archive.mjs` builds deterministic tar.gz packages from the local sources and stores archives outside the database.

The archive builder rejects unsafe paths, symlinks and hard-linked files; it caps packages at **256 files** and **8 MiB** (with separate path/depth checks). The server checks archived bytes on download. These safeguards do not replace authenticated administration, provenance or production security review.

The [Noqeri compiler](https://github.com/EMN90909/Noqeri) remains responsible for language/toolchain semantics; this repository owns the package catalog and Registry service. The [Noqeri Web](https://github.com/EMN90909/noqeri-web) repository is the separate website frontend.

## Testing and qualification

| Command | Scope |
| :--- | :--- |
| `npm test` | Public archive, SemVer and transport tests (NoeSQL fixture, not the real engine) |
| `node scripts/verify-index.mjs` | Offline catalog syntax and identity checks |
| `node scripts/verify-v040.mjs` | `0.4.0` release-candidate metadata checks |
| `node tools/package-quality.mjs --output=build/package-quality.json` | Source-quality evidence/report |
| `npm run test:integration` | Real NoeSQL `.noedb` bootstrap, persistence, reopen, hashes and API; requires the private session (Linux test) |
| `NOQERI_BIN=/absolute/path/to/noqeri node scripts/check-all-v040.mjs` | Compiler **check** fixtures for the `0.4.0` packages; requires a trusted compiler |

Run the real storage integration with `NOESQL_SESSION_MODULE` configured:

```sh
NOESQL_SESSION_MODULE=/absolute/path/to/NoeSQL/Runtime/noesql-session.mjs \
  npm run test:integration
```

Public CI runs [registry contract tests](.github/workflows/registry-integration.yml). The [private NoeSQL integration workflow](.github/workflows/noesql-private-integration.yml) is manual and requires a restricted `NOESQL_READ_TOKEN` and the configured private checkout/ref. **Public transport tests passing does not prove native Noqeri execution, real NoeSQL persistence or physical PGAS/RDMA compatibility.**

See [integration requirements](Doc/ECOSYSTEM_INTEGRATION.md), [release-candidate qualifications](docs/RELEASE_0_4_0_CANDIDATE.md), [quality gates](docs/QUALITY_GATES.md), and [compatibility evidence](compatibility/README.md).

## Current limitations and versioning

- The service package declares **`0.1.0`** in `package.json`, whereas the Noqeri project manifest currently declares **`1.0.0`** in `project.nqrin`. These declarations are **not synchronized** and do not replace individual package release versions.
- The `0.4.0` libraries remain historical `.noqeri` releases; their availability does not mean they are compatible with the latest Noqeri compiler. Canonical `.noqeri` migration requires **new** releases and test evidence.
- The Noqeri-native server-host binding is still an integration boundary; the public HTTP API uses Node and an external NoeSQL session.
- No production publishing/authentication service, audited native backend, complete cross-platform compiler matrix or broad provider-integration qualification is established here.

## Contributing and license

Contributions should preserve release immutability, avoid secrets in fixtures, and include negative/integrity tests for package or protocol changes. Start with the [quality gates](docs/QUALITY_GATES.md), [protocol](registry/PROTOCOL.md), and [security advisory policy](advisories/README.md).

This repository declares **GPL-3.0-only** in [LICENSE](LICENSE). NoeSQL is an independently licensed dependency and is not bundled or relicensed here.

<p align="center">
  Part of the <a href="https://github.com/EMN90909/Noqeri"><strong>Noqeri ecosystem</strong></a> · Built by <a href="https://noethric.xyz"><strong>Noethric</strong></a>
</p>
