# crypto 0.1.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/crypto.noqeri
- Exported functions: 6
- Host externs: 2

## Exported API

- cryptoCanSha256
- cryptoDigest
- cryptoDigestEqual
- cryptoDigestLengthValid
- cryptoRandomNonEmpty
- cryptoSha256OutputSize

## External host bindings required

- cryptoRandomFill
- cryptoSha256

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Constant-work digest comparison; does not replace cryptographic primitives.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
