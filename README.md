# Noqeri Registry

The canonical public package index and reference registry service for Noqeri.

This repository owns:

- the v1 registry protocol and deterministic `.nqpkg` archive format;
- official `noqeri/*` packages and standard-library source;
- package metadata used by Noqeri tooling;
- a small reference HTTP registry implementation.

The compiler remains environment-neutral. Registry access belongs to tooling, not the Noqeri language runtime.

## Run

```sh
go test ./...
go run ./cmd/registry
```

The service listens on `:8080` by default.

## Endpoints

- `GET /health`
- `GET /v1/index`
- `GET /v1/search?q=math`
- `GET /v1/packages/noqeri/core`
- `GET /v1/packages/noqeri/core/1.5.0`
- `GET /v1/packages/noqeri/core/1.5.0/download`
