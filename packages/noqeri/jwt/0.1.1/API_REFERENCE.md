# noqeri/jwt 0.1.1 API Reference

## 8 exported functions

- jwtBase64Byte
- jwtCompactValid
- jwtExpired
- jwtIssuerNameValid
- jwtNotYetValid
- jwtSegmentLength
- jwtSegmentOffset
- jwtTokenSizeValid

## 0 external host bindings


## Scope

Compact JWT shape checking, Base64URL field validation, segment offset inspection and explicit clock-leeway helpers.

## Limitations

Syntax checks do not verify signatures, issuer, audience, algorithms, revocation or expiration claims. A host JOSE implementation with pinned algorithms and a trusted key source MUST do authentication.
