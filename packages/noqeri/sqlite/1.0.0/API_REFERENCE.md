# sqlite 1.0.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/sqlite.noqeri
- Exported functions: 3
- Host externs: 3

## Exported API

- sqliteBusy
- sqliteHandleValid
- sqliteResultOk

## External host bindings required

- sqliteClose
- sqliteExec
- sqliteOpen

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
