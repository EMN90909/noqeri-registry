# noqeri/neon 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Neon management API v2 projects, branches, compute endpoints, databases, roles, and organization route constructors, with a credential-guarded request transport.

The new implementation exports 29 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

HTTP host and scoped Neon API tokens are required. Database SQL access is not implemented here. No credential storage or automatic branch failover. Project, branch and role IDs must be validated and URL-encoded by the caller.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
