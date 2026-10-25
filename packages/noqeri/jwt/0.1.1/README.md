# noqeri/jwt 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Compact JWT shape checking, Base64URL field validation, segment offset inspection and explicit clock-leeway helpers.

The new implementation exports 8 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Syntax checks do not verify signatures, issuer, audience, algorithms, revocation or expiration claims. A host JOSE implementation with pinned algorithms and a trusted key source MUST do authentication.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
