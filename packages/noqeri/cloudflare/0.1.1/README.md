# noqeri/cloudflare 0.1.1

**International preview · MIT · Noqeri edition 2026**

Cloudflare API v4 management helper endpoints.

## Implemented in native Noqeri

Zones, DNS record listing/creation/edit/deletion, purge-cache endpoint and purge-everything body, account-scoped Workers and KV URL helpers, route/pagination/status checks.

## Supported environment

- Source: `src/cloudflare.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/cloudflare.noqeri"

    print(cloudflareZonesUrl())
    print(cloudflareDNSRecordsUrl("zone_123"))
```

## Contracts and security

Requires scoped API token and actual HTTPS transport. DNS changes and purge requests are mutating operations. The API can report success while cache propagation remains asynchronous. IDs should be validated and encoded by the host.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
