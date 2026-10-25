//go:build dbdrivers

// SPDX-License-Identifier: MIT
package main

import (
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)
