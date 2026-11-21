# Noqeri Public Registry

This repository is the public, read-only Global Package Index and Distribution Hub for Noqeri nodules.

## Contract

- Anonymous GET and HEAD only; there are no publish or mutation endpoints.
- registry/index.json is the committed catalog. Only releases with verified sha256 integrity and safe .ndl paths are loaded.
- New `.ndl` files are deterministic gzip-compressed ustar archives containing `nodules.toml` as the package header, `package.noqeri` as the compiler manifest, and the selected `.noqeri` source, docs, and tests. Previously released headerless `.ndl` archives remain downloadable for compatibility.
- /v1/search, package metadata, versions, advisory metadata, and archive downloads are available to SDK and CLI clients.
- Yanked releases disappear from public metadata and downloads.

The private Supabase registry is the publishing, token, scanning, approval, takedown, and telemetry control plane. This public repository intentionally has no credentials and no write API.

## Run locally

    go test ./...
    go run ./cmd/registry -root . -listen :8080

No GitHub Actions are included.

