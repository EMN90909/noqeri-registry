# noqeri/convex 0.1.1

**International preview · MIT · Noqeri edition 2026**

Convex HTTP Functions API URL and request building.

## Implemented in native Noqeri

Query, mutation and action endpoint paths, HTTP JSON request bodies using path/args/format, function path scanning, status/pagination guard functions and bearer-token forwarding.

## Supported environment

- Source: `src/convex.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/convex.noqeri"

    print(convexQueryUrl("https://example.convex.cloud"))
    print(convexRequestBody("messages:list","{}"))
```

## Contracts and security

Function path/body helper assumes caller supplies a trusted function path and already serialized JSON args. It is not a JSON serializer or real HTTP implementation. Deployment URL must come from trusted configuration; raw user input must never be concatenated into a URL or JSON body.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
