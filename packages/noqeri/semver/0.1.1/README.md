# noqeri/semver 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Strict SemVer core major.minor.patch parser and numeric comparison, with prerelease/build suffix shape validation.

The new implementation exports 6 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Numeric core comparison does not yet fully rank prerelease identifier precedence, so do not use it as a replacement for an RFC 9110 or SemVer 2.0.0 complete constraint solver. Package resolver must compare prereleases separately.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
