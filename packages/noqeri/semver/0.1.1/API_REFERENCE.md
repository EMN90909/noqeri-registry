# noqeri/semver 0.1.1 API Reference

## 6 exported functions

- semverCompareCore
- semverDigit
- semverIdentifierByte
- semverMajorCompatible
- semverParseCore
- semverSuffixValid

## 0 external host bindings


## Scope

Strict SemVer core major.minor.patch parser and numeric comparison, with prerelease/build suffix shape validation.

## Limitations

Numeric core comparison does not yet fully rank prerelease identifier precedence, so do not use it as a replacement for an RFC 9110 or SemVer 2.0.0 complete constraint solver. Package resolver must compare prereleases separately.
