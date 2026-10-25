//go:build dbdrivers

package hostbridge

// Register real database/sql drivers in the test binary as well as the host executable.
import (
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)
