# Noqeri Registry

The canonical public package index and reference registry service for Noqeri 1.0.

This repository owns:

- the v1 registry protocol and deterministic `.nqpkg` archive format;
- official `noqeri/*` package source and metadata;
- SHA-256-addressed package archives;
- search/package/download HTTP endpoints;
- compile gates that build the real Noqeri compiler and type-check every published 1.0 package entrypoint.

The compiler remains environment-neutral. Registry networking belongs to tooling/hosts rather than being hidden inside the language runtime.

## Current package surface

The catalog currently includes core/std/test/security plus application-facing packages for JSON, HTTP contracts, HTTP server contracts, URL/HTML helpers, web/DOM/fetch/router, filesystem/environment, crypto contracts, DB, time and WebSockets. PostgreSQL, SQLite interoperability, raw networking and TLS are published as **experimental provider contracts** where the underlying provider is not yet a complete native Noqeri implementation.

A package being present in the index is not treated as evidence of production maturity. CI verifies syntax/type compatibility; provider implementations still need their own integration and security testing.

## Verify

```sh
go test ./...
go vet ./...
```

Registry CI additionally builds `EMN90909/Noqeri` and runs `noqeri check` against every published 1.0 package entrypoint.

## Run the reference service

```sh
go run ./cmd/registry
```

The service listens on `:8080` by default.

## Endpoints

```text
GET /health
GET /v1/index
GET /v1/search?q=json
GET /v1/packages/noqeri/core
GET /v1/packages/noqeri/core/1.0.0
GET /v1/packages/noqeri/core/1.0.0/download
```

Package downloads use the media type `application/vnd.noqeri.package+gzip`.

## License

GNU GPL v3 only (`GPL-3.0-only`). See `LICENSE`.

Made by [Noethric](https://noethric.xyz).
