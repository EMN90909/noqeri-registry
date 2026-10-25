# Noqeri Registry

A **Go + Noqeri** package registry for the Noqeri language.

- **Go**: HTTP server, package discovery, deterministic `.nqpkg` tar.gz
  archives, SHA-256 verification, index validation and tests.
- **Noqeri**: source policy, routing guards, validation contracts and
  language-level tests (`src/registry.noqeri`, `tests/*.noqeri`).
- **Package sources**: `.noqeri`; compiled bytecode: `.nqri`.
  No compatibility aliases for `.nqr` or `.nqo`.

## Start

```sh
go version  # requires 1.23+
make test
make verify
make run
```

Open `http://localhost:8080/health` or `/v1/packages`.
Set `PORT` to override the port. Compile native Noqeri policy with
`make check-noqeri` when the standalone Noqeri compiler is installed.

The service uses only the Go standard library. The prior Node.js, Python
and C++ implementations have been removed.

## API

`GET /health`, `/v1/status`, `/v1/index`, `/v1/packages`,
`/v1/search?q=<term>&offset=0&limit=50`, `/v1/advisories`,
`/v1/releases`, `/downloads`,
`/v1/packages/<namespace>/<package>`,
`/v1/packages/<namespace>/<package>/versions`,
`/v1/packages/<namespace>/<package>/<version>`,
`/v1/packages/<namespace>/<package>/<version>/download`.
`HEAD` is supported for reads.

## Status and intentional incompatibilities

This is a **source-index-backed, read-only service**. The former NoeSQL
session and writable data store, bootstrap import, persistent counters,
private-provider workflows and old compiler-download synchronization are
not implemented in Go yet. The Noqeri policy code is independently compiled
and checked in CI, not linked into the Go HTTP server yet.

See [architecture and limitations](docs/GO_NOQERI.md) for details.
Do not treat this as a feature-parity production replacement for NoeSQL.

## Catalog

The committed `registry/index.json` is the current source of truth.
Versioned package contents are in `packages/noqeri/`. Release identity,
archive integrity, symlink rules and yanked-release behavior are verified
by Go tests. Run `make audit` for package counts.
