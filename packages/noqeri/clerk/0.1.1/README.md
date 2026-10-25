# noqeri/clerk 0.1.1

**International preview · MIT · Noqeri edition 2026**

Clerk Backend API v1 route and request client helpers.

## Implemented in native Noqeri

Users, sessions, organizations, invitations, machines, API keys, M2M tokens and session revocation routes; CRUD wrappers, retries/status classification, and identifier validation.

## Supported environment

- Source: `src/clerk.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/clerk.noqeri"

    print(clerkUsersUrl())
    print(clerkSessionRevokeUrl("sess_123"))
```

## Contracts and security

Requires a trusted server-side secret key and injected providerHttpJson transport. Sensitive operations need correct roles/scopes. IDs and dynamic path segments must be encoded before concatenation; do not expose server keys in clients.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
