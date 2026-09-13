# noqeri/mysql

Official hosted-provider surface for MySQL and MariaDB.

The package deliberately keeps sockets, TLS, authentication plugins and native client-library calls behind host functions. Application code receives a stable Noqeri API while the unsafe boundary stays inside this package.

## API

- `mysqlConnect(connection)` opens a host-managed connection.
- `mysqlExec(connection, sql)` executes a statement without a row result.
- `mysqlQuery(connection, sql)` returns a row cursor handle.
- `mysqlRowsNext(rows)` advances a cursor.
- `mysqlRowsText(rows, column)` reads a text representation of a column.
- `mysqlRowsClose(rows)` releases the cursor.
- `mysqlClose(connection)` releases the connection.

Prepared/bound parameters are intentionally not emulated by string concatenation. A host adapter must add a real parameter-binding capability before this package exposes prepared statements as stable API.

MariaDB uses the same provider surface and default TCP port because it remains wire-compatible for this core contract.

License: GPL-3.0-only.
