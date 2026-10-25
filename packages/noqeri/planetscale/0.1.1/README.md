# noqeri/planetscale 0.1.1

**International preview | MIT | Noqeri Edition 2026**

PlanetScale organization, database, branch, deploy request and password-management URL builders and scoped HTTP request contracts.

The new implementation exports 27 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Management API adapter only. No database SQL driver, direct Vitess/MySQL connection, or branch schema deployment engine. Requires scoped API service tokens. Paths use caller validated identifiers.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
