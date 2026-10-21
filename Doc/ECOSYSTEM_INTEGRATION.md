# Noqeri Registry integration: implementation and constraints

Canonical language sources use `.noqeri`, compiled artifacts `.nqri`, metadata `.nqon`, NoeSQL storage `.noedb`, archives `.nqpkg`. Legacy `.nqr` package fixtures are retained for compatibility until release migration.

- `src/registry.noqeri` is the canonical Noqeri application and policy layer. Its host transport requires the qualified compiler and runtime; do **not** claim full native dogfooding until that route passes executable tests.
- `runtime/server.mjs` is the Node 22 transitional HTTP transport. It reads authoritative metadata from `registry.noedb` through `noesql/session`, **not** a duplicated Registry database. The NoeSQL module is private and MUST be installed with authorized credentials.
- `node runtime/bootstrap.mjs` imports `registry/index.json` **only into an empty database**. Back up `registry.noedb` before upgrades; bootstrap is intentionally not a production publishing endpoint.
- `runtime/archive.mjs` builds reproducible archives from the local `packages/` tree with bounded traversal and no symbolic links. Archive bytes go to `artifacts/sha256-<digest>.nqpkg`, not NoeSQL pages.
- `NOQERI_REGISTRY_API_URL=https://<registry-host>` is required for CLI and website. Configure both consumers to this exact service.
- `GET /v1/index`, `/v1/search`, `/v1/packages`, `/v1/packages/:namespace/:name`, `.../versions`, `.../:version` and `.../:version/download` return machine-readable metadata or verified bytes.
- Automatic resolution and explicit pinned downloads **refuse yanked versions**; previously cached pinned versions can be installed offline only after local integrity verification. Old Protocol descriptions that promised retrieving yanked archives online are superseded by this safe policy.
- There is no authenticated network publishing endpoint yet. Do not present bootstrap as safe multi-tenant publishing. Release immutability and advisory administration require an authenticated change-management path and deployment tests.
- NoeSQL's reference pager is a prototype with bounded state sizes; the production native + Zig full engine path remains unqualified.

## CI / private dependency

`EMN90909/NoeSQL` is private, but this repository is public. Standard GitHub Actions cannot install NoeSQL without a scoped read credential. Provide a read-only `NOESQL_READ_TOKEN` secret on the Registry repository and configure authenticated checkout/installation. Never expose the token in logs or client bundles. The public CI's NoeSQL install failure is a real blocker, not a green test.
