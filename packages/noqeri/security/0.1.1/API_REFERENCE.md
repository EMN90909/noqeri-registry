# noqeri/security 0.1.1 API Reference

## 7 exported functions

- securityBytesEqual
- securityHeaderSafe
- securityPasswordPolicy
- securityPathSegmentValid
- securityTokenLengthValid
- securityValueWithinLimits
- securityZero

## 0 external host bindings


## Scope

Defensive path segment validation, bounded comparisons, password policy checks, token-header validation and byte-buffer clearing.

## Limitations

Validation is not encryption or authorization. Comparison is full-length but constant-time guarantees require backend inspection. Password policy does not replace hashing (Argon2id) and secret storage. Host must guard symlink traversal.
