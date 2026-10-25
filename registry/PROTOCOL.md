# Registry HTTP Protocol v1: Go implementation

The Go service is a read-only source-index service with Noqeri policy sources.
It is not a NoeSQL-backed publishing system.

## Routes

- `GET|HEAD /health`
- `GET|HEAD /v1/status`
- `GET|HEAD /v1/index`
- `GET|HEAD /v1/packages`
- `GET|HEAD /v1/search?q=...&offset=0&limit=50`
- `GET|HEAD /v1/advisories`
- `GET|HEAD /v1/releases`
- `GET|HEAD /downloads`
- `GET|HEAD /v1/packages/{namespace}/{name}`
- `GET|HEAD /v1/packages/{namespace}/{name}/versions`
- `GET|HEAD /v1/packages/{namespace}/{name}/{version}`
- `GET|HEAD /v1/packages/{namespace}/{name}/{version}/download`

Responses are JSON unless requesting an HTML page or a gzip package artifact.
Yanked versions are discoverable but not downloadable. Download responses
provide an SHA-256 digest through `X-Archive-SHA256` and have the content type
`application/vnd.noqeri.package+gzip`.

The Go service refuses write methods; there is no public publishing endpoint.
Package metadata loads from the committed catalog on restart. It is not a
transactional database and cannot preserve the former NoeSQL counters or
publisher sessions. No compatibility with old `.nqr` and `.nqo` sources.

## Security boundaries

Inputs have bounded URL/search/query sizes. Package IDs and versions are
strictly validated, archive traversal and symbolic links are rejected, and
package archives are deterministic. Go tests cover behavior and negative cases.

The standalone Noqeri compiler checks `Programs/registry.noqeri` and
`tests/registry_contracts.noqeri` independently. Go still owns HTTP dispatch,
and Noqeri is not dynamically linked into the Go process.
