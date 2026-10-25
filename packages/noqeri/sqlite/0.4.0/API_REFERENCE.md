# sqlite 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/sqlite.noqeri
- Exported functions: 5
- Host externs: 3

## Exported API

- sqliteBusy
- sqliteHandleValid
- sqliteIdentifierValid
- sqliteResultOk
- sqliteRetryable

## External host bindings required

- sqliteClose
- sqliteExec
- sqliteOpen

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

SQLite identifier token checks and retryable return-code classification, not a SQL parser.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
