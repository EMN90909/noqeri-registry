# noqeri/firebase 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Firebase Auth REST v1 and Cloud Firestore REST v1 route helpers, API-key credential checks, bearer request wrappers and quota/error classification.

The new implementation exports 24 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

This is a host-backed REST adapter, not the Firebase SDK. Callers must supply correctly serialized JSON, configured project IDs and encoded document paths. Authentication/token refresh, DNS allowlisting, retry jitter, Firestore transaction semantics and security rules enforcement belong to host and server.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
