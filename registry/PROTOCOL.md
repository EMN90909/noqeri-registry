# Noqeri Registry Protocol v1

The protocol is intentionally independent of operating systems and compiler implementation details.

## Identity

Packages are identified by `namespace/name@version`, for example `noqeri/core@1.5.0`.

Versions are immutable once published. A version may be yanked from new resolution, but its content must remain retrievable for existing lock files.

## Integrity

`download` returns a deterministic gzip-compressed tar archive (`.nqpkg`). Package metadata returns a `sha256:<hex>` digest calculated over the exact archive bytes. Clients must verify this digest before extraction.

## Read API

- `GET /health`
- `GET /v1/index`
- `GET /v1/search?q=...`
- `GET /v1/packages/{namespace}/{name}`
- `GET /v1/packages/{namespace}/{name}/{version}`
- `GET /v1/packages/{namespace}/{name}/{version}/download`

A future authenticated publishing API can be added without changing package identity or archive semantics.
