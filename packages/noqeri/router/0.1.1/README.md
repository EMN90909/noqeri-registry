# noqeri/router 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Strict route pattern validation, colon-parameter matching, path character restrictions, suffix/prefix route inspection and bounded match operations.

The new implementation exports 6 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

No URL decoder, HTTP middleware registry, trie storage or host server integration. Host must decode URL paths exactly once and reject encoded separators/traversal. Parameters are matched by segment, without type conversion.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
