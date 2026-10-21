# Noqeri Registry v1 integration status

**Canonical data owner:** `registry.noedb` via the external NoeSQL store. No independent database implementation is kept in this repo. The Registry's `.nqpkg` files reside under `data/artifacts/<namespace>/<name>/<version>.nqpkg`, not inside .noedb.

`src/registry.noqeri` and `Programs/registry.noqeri` express Noqeri application policy and legacy host ABI interface. Until the Noqeri compiler and runtime can drive the NoeSQL provider through the native ABI, `server.mjs` and `service/*` provide **transitional Node transport, initialization and archive generation**. This is a usable reference service design, not a fully native Noqeri application, and native qualification remains open.

The service exposes deterministic machine-readable:
- `GET /health`
- `GET /v1/index` and `GET /v1/packages`
- `GET /v1/search?q=...`
- `GET /v1/packages/{namespace}/{name}`
- `GET /v1/packages/{namespace}/{name}/versions`
- `GET /v1/packages/{namespace}/{name}/{version}`
- `GET /v1/packages/{namespace}/{name}/{version}/download`

The index is a bootstrap input only for the initial import into an empty `registry.noedb`. Subsequent reads must come from the database. Do not run multiple initializer instances against an uninitialized database. The service presently has no authenticated publishing API, migrations of evolving catalog schemas or cluster-safe concurrent initialization; it must not be advertised as a complete production registry.

Only valid bounded path components and semver versions are allowed. Archive generation rejects links, nonregular files, traversal, oversized data and missing/unsafe entrypoints. Responses publish SHA-256 of the exact compressed archive. The CLI verifies that digest before extraction and rehashes cached source files. Existing released packages with `.nqr` manifests/sources are intentionally retained. New package releases should have a `.noqeri` manifest and sources, and must not mutate old immutable version bytes.

Unpinned resolution must skip yanked versions. Explicit pinned yanked versions are retrievable for deterministic existing lock files. Index release metadata and exact version metadata must agree. No arbitrary upstream URLs are used by the Registry HTTP service.

## Running and checking

Install the qualified external `noesql` package or use the absolute `NOESQL_STORE_PATH` path to an existing NoeSQL checkout's `Runtime/noesql-store.mjs`. Run `node server.mjs`; set `NOQERI_REGISTRY_DATA` for a dedicated writable data directory. The NoeSQL store must be verified first. Existing `node scripts/verify-index.mjs` and `node --test tests/registry-http.test.mjs` test catalog input and HTTP transport without engine execution. `node --test tests/registry-api.test.mjs` exercises the actual external store, native-format bytes and persisted metadata when that provider is installed.

The `.nqon` manifest parser has not been qualified; `project.noqeri` remains the active project manifest. Keep `project.nqr` and historical package releases as compatibility artifacts.
