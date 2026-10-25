# noqeri/regex-lite 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Safe byte-oriented literal matching, prefix/suffix checks and bounded wildcard matching using * and ? metacharacters.

The new implementation exports 7 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Not a full regular-expression engine: no capture groups, classes, Unicode semantics, lookarounds, backreferences, or regex compiler. Wildcard semantics are documented as a restricted subset.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
