# auth0 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Users, organizations, roles, clients, connections, logs, jobs, resource servers, actions, tickets; CRUD helper methods; identifier checks; status classes and bounded retry hints.

## Known limits

A management API bearer token and configured network host are required. The route builder accepts a trusted tenant domain. Caller must percent-encode user identifiers and validate the tenant against an allowlist; the wrapper does not implement OAuth token acquisition, automatic retries, rate-limit parsing, RBAC permissions or actual HTTP transport.
