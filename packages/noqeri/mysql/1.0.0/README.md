# noqeri/mysql 1.0.0

Official Noqeri provider contract for MySQL and MariaDB.

The package keeps socket, TLS and platform connector details behind Noqeri's `unsafe extern` host boundary. Application code works with checked `Connection`, `Statement` and `Rows` handles, prepared `?` parameters and explicit transactions.

```nqr
import package "noqeri/mysql"

let db = connect("mysql://user:pass@localhost:3306/app")
let statement = prepare(db, "SELECT name FROM users WHERE id = ?")
bind_i64(statement, 0 as usize, 42 as i64)
let rows = query(statement)
while rows_next(rows) {
    print(rows_text(rows, 0 as usize))
}
rows_close(rows)
statement_close(statement)
close(db)
```

Both `mysql://` and `mariadb://` DSNs are accepted. Passwords should be supplied by environment/secret facilities rather than committed source. The package is GPL-3.0-only.
