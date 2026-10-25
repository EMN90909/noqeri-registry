# noqeri/fetch 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Asynchronous fetch-host lifecycle helpers, request URL validation, HTTP response classification, retry backoff and cancellation guards.

The new implementation exports 14 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

The runtime must supply fetchStart, fetchStatus, fetchText, fetchCancel. This package cannot enforce DNS SSRF protection, redirect policies, TLS certificate validation or timeouts by itself. Applications should use explicit host allowlists and bounded responses.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
