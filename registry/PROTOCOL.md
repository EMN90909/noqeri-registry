# Noqeri Registry Protocol v1 (integration branch)

Noqeri Registry is the authoritative service for packages, metadata and advisories, backed by NoeSQL `registry.noedb`. Archives `.nqpkg` are content addressed and stored separately in filesystem/object storage. The Registry's canonical application source is `.noqeri`. Node currently hosts the transport until Noqeri's native runtime/Stage-2 qualification passes.

## Package identity

`namespace/name@version` uses lowercase ASCII namespace/name matching `^[a-z0-9][a-z0-9-]*$` and SemVer 2 version. Versions are immutable once published. Historical release `.noqeri` payloads remain importable under an explicit compatibility path.

## Read-only REST endpoints

- `GET /health`
- `GET /v1/index` or `GET /v1/packages`: deterministic package lists
- `GET /v1/search?q=<term>`
- `GET /v1/packages/{namespace}/{name}`
- `GET /v1/packages/{namespace}/{name}/versions`
- `GET /v1/packages/{namespace}/{name}/{version}`
- `GET /v1/packages/{namespace}/{name}/{version}/download`
- `GET /v1/advisories`

Version metadata includes `version`, `yanked`, `archiveIntegrity` (`sha256:<lowercase64>`), `entry`, `dependencies` and other metadata. `download` streams the actual deterministic tar.gz `.nqpkg` bytes. Clients must verify SHA-256 of the **archive bytes** before extraction and enforce path/file/byte limits. Do not fetch package content directly from GitHub.

**Yanked policy:** No yanked version is selected automatically. An explicitly requested pinned yanked version is also rejected **online**, including the public download route. A verified locally cached pinned version may be used offline. This supersedes the earlier v1 draft promise that yanked archives would always remain publicly downloadable; that behavior was not secured by the new implementation.

## Schema

`packages`, `versions`, `dependencies`, `publishers`, `package_publishers`, `downloads` and `advisories` are NoeSQL metadata tables. They hold artifact location/digest but never archive blobs.

## Write safety and current limitations

No unauthenticated Registry publishing endpoint exists. `node runtime/bootstrap.mjs` performs a one-time, local, operator-controlled import of legacy `registry/index.json` into a new, empty `.noedb` file, and refuses preexisting metadata. Do not use this as a multi-tenant publication interface or imply publishers/advisory management have been qualified.

The Node reference NoeSQL implementation and private dependency install require additional deployment and native release gates. A public Registry workflow cannot install private `EMN90909/NoeSQL` unless a read-only GitHub token is configured.
