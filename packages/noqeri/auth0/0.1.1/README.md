# noqeri/auth0 0.1.1

**International preview · MIT · Noqeri edition 2026**

Auth0 Management API v2 client policy and route constructors.

## Implemented in native Noqeri

Users, organizations, roles, clients, connections, logs, jobs, resource servers, actions, tickets; CRUD helper methods; identifier checks; status classes and bounded retry hints.

## Supported environment

- Source: `src/auth0.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/auth0.noqeri"

    print(auth0UsersUrl("example.us.auth0.com"))
    print(auth0RoleUsersUrl("example.us.auth0.com","rol_example"))
```

## Contracts and security

A management API bearer token and configured network host are required. The route builder accepts a trusted tenant domain. Caller must percent-encode user identifiers and validate the tenant against an allowlist; the wrapper does not implement OAuth token acquisition, automatic retries, rate-limit parsing, RBAC permissions or actual HTTP transport.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
