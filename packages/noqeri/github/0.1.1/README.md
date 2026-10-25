# noqeri/github 0.1.1

**International preview | MIT | Noqeri Edition 2026**

GitHub REST API repository, pull request, issue, workflow, contents and release route builders with authenticated request wrappers and HTTP status handling.

The new implementation exports 28 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Requires a secure host HTTP implementation and scoped GitHub token. Dynamic path components must be validated/encoded by caller. No pagination iterator, GraphQL client, webhook signature verifier, or GitHub App token minting is implemented.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
