# clerk 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Users, sessions, organizations, invitations, machines, API keys, M2M tokens and session revocation routes; CRUD wrappers, retries/status classification, and identifier validation.

## Known limits

Requires a trusted server-side secret key and injected providerHttpJson transport. Sensitive operations need correct roles/scopes. IDs and dynamic path segments must be encoded before concatenation; do not expose server keys in clients.
