# noqeri/sentry 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Sentry authenticated REST management routes, HTTP retry policy, DSN size constraints and lightweight event metadata handling.

The new implementation exports 28 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

REST management API is NOT the same as Sentry's envelope ingestion endpoint. This package does not sign sessions, build a complete Sentry envelope, capture crash stacks, or transmit events without a configured secure host.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
