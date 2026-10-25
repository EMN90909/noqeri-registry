# noqeri/sqlite 0.1.1 API Reference

## 17 exported functions

- sqliteBeginSql
- sqliteBusy
- sqliteBusyDelay
- sqliteCloseChecked
- sqliteCommitSql
- sqliteConstraint
- sqliteCorrupt
- sqliteHandleValid
- sqliteIOError
- sqliteIdentifierSizeValid
- sqliteQuote
- sqliteQuoteSize
- sqliteRetryable
- sqliteRollbackSql
- sqliteRunChecked
- sqliteStatementSizeValid
- sqliteSuccess

## 3 external host bindings

- sqliteClose
- sqliteExecute
- sqliteOpen

## Scope

SQLite result-code classification, bounded SQL identifier quoting, transaction policy and host-backed statement execution.

## Limitations

Not an embedded SQLite database engine. Host must link SQLite and implement prepared statements, bound values, database open/close, busy handling and durability. Never interpolate user data into SQL.
