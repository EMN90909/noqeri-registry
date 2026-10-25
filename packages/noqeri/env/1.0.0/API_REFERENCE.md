# env 1.0.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/env.noqeri
- Exported functions: 4
- Host externs: 2

## Exported API

- envAssignmentSeparator
- envNameByteValid
- envNameValid
- envValueSafe

## External host bindings required

- envGet
- envHas

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Environment variable name and assignment scanning.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
