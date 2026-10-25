# jwt 0.1.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/jwt.noqeri
- Exported functions: 7
- Host externs: 0

## Exported API

- jwtAlgorithmAllowed
- jwtBase64UrlByteValid
- jwtCompactShapeValid
- jwtExpired
- jwtNotBeforeValid
- jwtSegmentCountValid
- jwtTokenBytesValid

## Expanded functionality

Structural validation of JWT base64url segments; token signatures must still be cryptographically verified by a host.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
