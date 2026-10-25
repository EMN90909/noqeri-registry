# Ecosystem integration: Go + Noqeri

The Registry was rewritten as a read-only Go service with native Noqeri policy
sources. This document supersedes the original Node/NoeSQL integration plan.

- `cmd/registry`: Go 1.23 HTTP transport and request handling.
- `internal/registry`: catalog loader, strict package validation, SHA-256
  verified `.nqpkg` generation, package discovery and downloads.
- `cmd/registryctl`: Go audit and source verification.
- `src/registry.noqeri`: independently compiled Noqeri policy functions.
- `tests/registry_contracts.noqeri`: Noqeri compiler-checked policy contracts.

`registry/index.json` is the active read-only source index. There is **no**
NoeSQL session integration, transactional publisher state, persistent download
counter or SDK bootstrap migration in this implementation. The Go runtime does
not dynamically execute Noqeri handlers; compile-time Noqeri policy checks are
a separate CI quality gate.

Run `go test ./...`, `go run ./cmd/registryctl verify`, and
`make check-noqeri`. See `docs/GO_NOQERI.md` for the migration limits.
