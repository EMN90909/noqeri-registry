# Noqeri Registry (0.1.0 canonical package baseline)

Official package registry source and **experimental NoeSQL-backed Registry API v1**. Canonical Registry application, test and policy sources use `.noqeri`; package releases are distributed in deterministic, checksum-verified `.nqpkg` archives.

## Architecture

```text
Noqeri Registry app (src/registry.noqeri)
           |
        host ABI (native path not fully qualified)
           |
Registry HTTP transport (runtime/server.mjs)
           |
NoeSQL session (private dependency, NOESQL_SESSION_MODULE)
           |
registry.noedb  +  artifacts/sha256-<digest>.nqpkg
```

The Node 22 transport provides `GET /health`, `/v1/index`, `/v1/search`, `/v1/packages/...`, `/v1/advisories` and verified download routes. Its metadata store is NoeSQL's `.noedb` reference implementation, **not a production-qualified native Noqeri database driver**. There is no authenticated public publish endpoint. NoeSQL remains private; it is not vendored into this public repository.

The historical `registry/index.json` is a **one-time migration input**, not the HTTP service's authoritative data after bootstrap. Run the importer only against an empty database. Archive bytes stay on filesystem/object storage, not inside the database.

## Run locally

Requires Node.js 22+, an authorized local checkout/installation of private NoeSQL, and package sources.

```sh
export NOESQL_SESSION_MODULE=/absolute/path/to/NoeSQL/Runtime/noesql-session.mjs
npm run bootstrap       # explicit one-time import; do not re-run on existing data
npm start               # Node transport with /v1 endpoints
```

The canonical Noqeri-native application source is `Programs/registry.noqeri`, importing `src/registry.noqeri`. The `registryHostServe` native ABI remains under qualification and must not be described as fully integrated with the Node transport.

## Tests and release gates

```sh
npm test                  # public transport, semver and artifact integrity checks
npm run test:integration  # requires private NoeSQL session, persists/reopens registry.noedb
NOQERI_BIN=/absolute/path/to/noqeri npm run test:compiler # explicit native compiler qualification
node scripts/verify-index.mjs
```

Public GitHub Actions CI runs these public contract tests. The genuine NoeSQL metadata persistence test reopens the file with a fresh engine session and is separately gated behind the private NoeSQL checkout. An authorized workflow is available at [NoeSQL E2E (manual)](.github/workflows/noesql-e2e-manual.yml); it needs a scoped read-only `NOESQL_READ_TOKEN` secret. **Passing public mocks does not establish private engine qualification.**

## Canonical package baseline (0.1.0)

The registry contains 55 package coordinates, each with a canonical `0.1.0` source release under `packages/noqeri/<name>/0.1.0`. Package manifests, entrypoints, tests and examples in those new directories use `.noqeri`. Compiled Noqeri output uses `.nqri`; this repository contained no `.nqo` files.

**Historical releases are intentionally retained.** The older `.nqr` files under older version directories are immutable. Renaming historical release bytes would invalidate reproducibility and checksum assurances. The bootstrap index marks previous active releases yanked as part of the requested `0.1.0` reset; this can break online installs with pinned older versions. See [migration notes](docs/MIGRATION_0_1_0.md) before deploying.

The new sources are experimental migration candidates, not evidence of native compiler parity. The Node 22 `.mjs` compatibility transport still serves HTTP because the Noqeri host ABI, native NoeSQL connection and Stage-2 executable have not been qualified. **The registry has not been fully rewritten from JavaScript into a working pure-Noqeri service.**

## License

GPL-3.0-only. See [LICENSE](LICENSE). NoeSQL is a separate private project and is not relicensed by this repository.
