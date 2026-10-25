# postgres 0.1.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/postgres.noqeri
- Exported functions: 5
- Host externs: 3

## Exported API

- postgresHandleValid
- postgresIdentifierValid
- postgresMessageLengthValid
- postgresPayloadLengthValid
- postgresProtocolVersion

## External host bindings required

- postgresClose
- postgresExec
- postgresOpen

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

PostgreSQL identifier-token validation and strict protocol message length bounds.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
