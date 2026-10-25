# noqeri/http 0.1.1

**International preview | MIT | Noqeri Edition 2026**

RFC-style HTTP status categories, header validation, safe methods, bounded request metadata, and strictly validated percent encoding for query bytes.

The new implementation exports 17 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Pure HTTP protocol helpers only. Transport, TLS, parsing full HTTP messages and cookie/session management require a host. Raw URLs require independent DNS, redirect and authority validation.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
