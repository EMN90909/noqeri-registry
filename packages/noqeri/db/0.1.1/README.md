# noqeri/db 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Defensive database host adapter with checked handles, SQL identifier quoting, bounded query size, explicit transaction status and retry policy.

The new implementation exports 16 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Actual database transactions and parameter binding require native host functions. Escaping identifiers does NOT escape data values. Never interpolate untrusted values into SQL. The native host decides isolation and durability; these functions alone offer neither.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
