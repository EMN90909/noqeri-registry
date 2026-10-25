# noqeri/db 0.1.1 API Reference

## 16 exported functions

- dbBeginSql
- dbCloseIfValid
- dbCommitSql
- dbExecuteIfValid
- dbFailure
- dbHandleValid
- dbIdentifierChar
- dbIdentifierValid
- dbQuerySizeValid
- dbQuoteIdentifier
- dbQuotedIdentifierSize
- dbRetryDelayMillis
- dbRetryable
- dbRollbackSql
- dbSuccess
- dbTransactionValid

## 3 external host bindings

- noqeriDbClose
- noqeriDbExecute
- noqeriDbOpen

## Scope

Defensive database host adapter with checked handles, SQL identifier quoting, bounded query size, explicit transaction status and retry policy.

## Limitations

Actual database transactions and parameter binding require native host functions. Escaping identifiers does NOT escape data values. Never interpolate untrusted values into SQL. The native host decides isolation and durability; these functions alone offer neither.
