# noqeri/postgres 0.1.1 API Reference

## 10 exported functions

- postgresFrameLengthValid
- postgresIdentifierValid
- postgresQuoteIdentifier
- postgresQuotedSize
- postgresReadU32BE
- postgresRetryable
- postgresSQLStateChar
- postgresSQLStateValid
- postgresTransactionTransition
- postgresWriteU32BE

## 0 external host bindings


## Scope

PostgreSQL SQL identifier quoting, SQLSTATE classification, frontend/backend frame sizing and bounded transaction-state helpers.

## Limitations

Not a Postgres wire-protocol client. Actual TLS, authentication, prepared statements, server-side binds and transaction isolation require a host. Never interpolate data values into SQL.
