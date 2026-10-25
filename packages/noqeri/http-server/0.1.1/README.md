# noqeri/http-server 0.1.1

**International preview | MIT | Noqeri Edition 2026**

HTTP server host adapter with validated port and status rules, method/route safety checks, response-header validation, and bounded request metadata.

The new implementation exports 15 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

A native HTTP listener, TLS, routing dispatch and I/O lifecycle must be provided by the host. This package cannot itself accept sockets or parse RFC 9110 HTTP messages. Path validation is byte-oriented and does not replace URL decoding or authorization. Never write unescaped content to HTML.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
