# noqeri/http-client 0.1.1

**International preview | MIT | Noqeri Edition 2026**

HTTP client request policy, HTTPS URL inspection, header token validation, response/status classification, retry scheduling and host-backed JSON requests.

The new implementation exports 20 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Actual socket/TLS/redirect handling requires a secure providerHttpJson host. HTTPS textual checks are not SSRF prevention; DNS allowlists, redirect destination checks, certificate verification, timeout enforcement and secret storage must happen in the host. No native streaming HTTP or cookie jar is bundled.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
