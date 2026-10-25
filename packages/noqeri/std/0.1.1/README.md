# noqeri/std 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Foundational byte-slice operations, character classification, safe range manipulation and decimal integer formatting without host dependencies.

The new implementation exports 14 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Minimal portable standard utilities, not an OS standard library; filesystem, concurrency, Unicode normalization, heap allocation and networking must be implemented separately.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
