# noqeri/security 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Defensive path segment validation, bounded comparisons, password policy checks, token-header validation and byte-buffer clearing.

The new implementation exports 7 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Validation is not encryption or authorization. Comparison is full-length but constant-time guarantees require backend inspection. Password policy does not replace hashing (Argon2id) and secret storage. Host must guard symlink traversal.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
