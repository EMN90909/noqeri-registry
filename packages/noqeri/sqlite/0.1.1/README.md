# noqeri/sqlite 0.1.1

**International preview | MIT | Noqeri Edition 2026**

SQLite result-code classification, bounded SQL identifier quoting, transaction policy and host-backed statement execution.

The new implementation exports 17 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Not an embedded SQLite database engine. Host must link SQLite and implement prepared statements, bound values, database open/close, busy handling and durability. Never interpolate user data into SQL.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
