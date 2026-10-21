# Noqeri Registry

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
node scripts/verify-index.mjs
```

Public GitHub Actions CI runs these public contract tests. The genuine NoeSQL metadata persistence test reopens the file with a fresh engine session and is separately gated behind the private NoeSQL checkout. An authorized workflow is available at [NoeSQL E2E (manual)](.github/workflows/noesql-e2e-manual.yml); it needs a scoped read-only `NOESQL_READ_TOKEN` secret. **Passing public mocks does not establish private engine qualification.**

## Historical package releases

As of October 21, 2026, `main` contains **8 active `.noqeri` files and 425 historical `.nqr` files**. The `packages/` tree contains immutable historical `.nqr` and `package.nqr` sources. Those files are **legacy release contents**, not current application source. Renaming or overwriting already-published files would break reproducibility, archival checksums, and existing lockfiles. New packages should use canonical `.noqeri` and `package.noqeri` and publish new versions, not mutate historical versions. Use the `tests/fixtures/legacy/` pattern for compatibility tests as needed.

The `0.4.0` package refresh is in the historical index, and earlier `1.x` versions may be yanked. The current Registry API declines public downloads of yanked versions, so restoring old pinned online installs needs an explicitly reviewed policy change. Do not claim all 54 package releases have native Stage-2 compiler parity.

`registry/index.json` may also contain historical names like NoqeriDB, NoqeriSQL or references to `.nqo`. These are archive descriptions and **not** endorsements of those superseded active formats.

## License

GPL-3.0-only. See [LICENSE](LICENSE). NoeSQL is a separate private project and is not relicensed by this repository.
