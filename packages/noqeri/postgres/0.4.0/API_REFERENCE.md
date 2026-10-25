# postgres 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/postgres.noqeri
- Exported functions: 3
- Host externs: 3

## Exported API

- postgresHandleValid
- postgresMessageLengthValid
- postgresProtocolVersion

## External host bindings required

- postgresClose
- postgresExec
- postgresOpen

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
