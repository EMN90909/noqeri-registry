# cloudflare 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Zones, DNS record listing/creation/edit/deletion, purge-cache endpoint and purge-everything body, account-scoped Workers and KV URL helpers, route/pagination/status checks.

## Known limits

Requires scoped API token and actual HTTPS transport. DNS changes and purge requests are mutating operations. The API can report success while cache propagation remains asynchronous. IDs should be validated and encoded by the host.
