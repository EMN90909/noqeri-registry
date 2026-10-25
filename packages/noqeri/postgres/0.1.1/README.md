# noqeri/postgres 0.1.1

**International preview | MIT | Noqeri Edition 2026**

PostgreSQL SQL identifier quoting, SQLSTATE classification, frontend/backend frame sizing and bounded transaction-state helpers.

The new implementation exports 10 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Not a Postgres wire-protocol client. Actual TLS, authentication, prepared statements, server-side binds and transaction isolation require a host. Never interpolate data values into SQL.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
