# noqeri/env 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Portable environment name and assignment parser with bounds-aware key/value offset computation, CRLF injection checks, and host value retrieval contracts.

The new implementation exports 10 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Environment access is host-dependent. No dotenv escape interpolation or filesystem loading is implemented. Raw secrets must not be printed or committed.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
