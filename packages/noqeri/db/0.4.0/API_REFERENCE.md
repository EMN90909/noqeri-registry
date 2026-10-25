# db 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/db.noqeri
- Exported functions: 6
- Host externs: 3

## Exported API

- dbAffectedRowsValid
- dbHandleValid
- dbIsTransientError
- dbResultError
- dbResultOk
- dbTransactionStatusValid

## External host bindings required

- noqeriDbClose
- noqeriDbExecute
- noqeriDbOpen

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Defensive status and handle checks for database bridges.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
