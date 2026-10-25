# Go + Noqeri registry architecture

The registry has deliberately broken compatibility with the old JavaScript,
Python and C++ project implementation. Go owns HTTP transport, package indexing,
content-addressed archive generation, verification and developer tools.
Noqeri owns the native policy source in `src/registry.noqeri` and the
language-level contract suite in `tests/registry_contracts.noqeri`.

**Integration boundary:** Noqeri policy sources are compiled/checked independently
in CI. The Go server currently implements corresponding routing and validation
rules in Go rather than dynamically invoking compiled Noqeri code; it would be
incorrect to describe its HTTP handlers as executing Noqeri at runtime.

## Run and test

```sh
make build
make run
make test
make verify
make check-noqeri  # requires installed Stage-0 Noqeri compiler
```

HTTP: /health, /v1/status, /v1/index, /v1/packages,
/v1/search, /v1/advisories, /v1/releases, /downloads,
/v1/packages/{namespace}/{name}, /versions, /{version}, /{version}/download.

**Breaking limitations:** the former NoeSQL session storage is not wired into
Go. The server reads `registry/index.json` on startup, serves a read-only
source catalog, and computes deterministic SHA-256-addressed `.nqpkg`
archives from package trees. There is no publishing, no download counter
persistence and no atomic NoeSQL transaction bridge. Avoid claiming NoeSQL
durability, scale or feature parity. A registry update requires a restart.
Do not deploy against an existing writable NoeSQL-backed production registry
without a separate database migration and rollback plan.

Yanked releases remain listed but cannot be downloaded. The server rejects
path traversal, encoded separators, symlinks, oversized archives, malformed
version coordinates and unsupported HTTP methods. See Go tests for exercised
contracts. The **registry HTTP server** itself needs no third-party Go modules. The
**separate** privileged `cmd/noqeri-host` uses pinned pgx and modernc SQLite
drivers. See [host runtime](HOST_RUNTIME.md). The executable Go host now serves
provider HTTPS requests, transactions, and authenticated webhook verification
through a versioned local JSON-lines process protocol. Its ABI service mapping
exists, but the Stage-0 Noqeri compiler does not automatically bind extern
symbols to that process. Live provider access is opt-in with separately
configured credentials; ordinary CI performs deterministic local tests.
