# Noqeri Registry integration: implementation and constraints

Canonical language sources use `.noqeri`, compiled artifacts `.nqri`, metadata `.nqon`, NoeSQL storage `.noedb`, archives `.nqpkg`. Legacy `.noqeri` package fixtures are retained for compatibility until release migration.

- `src/registry.noqeri` is the canonical Noqeri application and policy layer. Its host transport requires the qualified compiler and runtime; do **not** claim full native dogfooding until that route passes executable tests.
- `runtime/server.mjs` is the Node 22 transitional HTTP transport. It reads authoritative metadata from `registry.noedb` through `noesql/session`, **not** a duplicated Registry database. The NoeSQL module remains private and MUST be installed into the trusted runtime. Set `NOESQL_SESSION_MODULE` to its absolute `Runtime/noesql-session.mjs` path (or install the module into the Node runtime via an authorized private dependency). No public build or package includes private database source.
- `node runtime/bootstrap.mjs` imports `registry/index.json` **only into an empty database**. Back up `registry.noedb` before upgrades; bootstrap is intentionally not a production publishing endpoint.
- `runtime/archive.mjs` builds reproducible archives from the local `packages/` tree with bounded traversal and no symbolic links. Archive bytes go to `artifacts/sha256-<digest>.nqpkg`, not NoeSQL pages.
- `NOQERI_REGISTRY_API_URL=https://<registry-host>` is required for CLI and website. Configure both consumers to this exact service.
- `GET /v1/index`, `/v1/search`, `/v1/packages`, `/v1/packages/:namespace/:name`, `.../versions`, `.../:version` and `.../:version/download` return machine-readable metadata or verified bytes.
- Automatic resolution and explicit pinned downloads **refuse yanked versions**; previously cached pinned versions can be installed offline only after local integrity verification. Old Protocol descriptions that promised retrieving yanked archives online are superseded by this safe policy.
- There is no authenticated network publishing endpoint yet. Do not present bootstrap as safe multi-tenant publishing. Release immutability and advisory administration require an authenticated change-management path and deployment tests.
- NoeSQL's reference pager is a prototype with bounded state sizes; the production native + Zig full engine path remains unqualified.

## CI / private dependency

Public archive and HTTP transport tests run with `npm test` and do not require private source. Real NoeSQL `.noedb` E2E is gated separately using `npm run test:integration` with `NOESQL_SESSION_MODULE=/absolute/path/to/NoeSQL/Runtime/noesql-session.mjs`. The `Registry private NoeSQL end-to-end` manual GitHub workflow requires the read-only secret and refuses to proceed without it.

`EMN90909/NoeSQL` is private, but this repository is public. The public contracts workflow does not require NoeSQL credentials. For private integration qualification, provide read-only `NOESQL_READ_TOKEN` in the Registry repository so the manual `workflow_dispatch` job can check out private NoeSQL into its isolated workspace. Never expose the token in logs or client bundles. The public CI's NoeSQL install failure is a real blocker, not a green test.
