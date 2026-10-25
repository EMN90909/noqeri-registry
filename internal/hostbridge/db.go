// SPDX-License-Identifier: MIT
// Secure parameterized database bridge. No SQL string interpolation.
package hostbridge

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type handle struct {
	db *sql.DB
	tx *sql.Tx
}
type DBHost struct {
	mu      sync.Mutex
	current uint64
	handles map[uint64]*handle
}

func NewDBHost() *DBHost { return &DBHost{handles: make(map[uint64]*handle)} }
func registered(name string) bool {
	for _, n := range sql.Drivers() {
		if n == name {
			return true
		}
	}
	return false
}
func (h *DBHost) Open(ctx context.Context, driver string, env EnvFunc) (uint64, error) {
	var sqlDriver, dsn string
	switch driver {
	case "postgres":
		sqlDriver = "pgx"
		dsn = env("NOQERI_POSTGRES_DSN")
	case "sqlite":
		sqlDriver = "sqlite"
		dsn = env("NOQERI_SQLITE_PATH")
	default:
		return 0, errors.New("unsupported_database")
	}
	if !registered(sqlDriver) {
		return 0, errors.New("database_driver_not_linked")
	}
	if len(dsn) == 0 || len(dsn) > 8192 {
		return 0, errors.New("database_configuration_missing")
	}
	if driver == "postgres" {
		if !strings.HasPrefix(dsn, "postgres://") && !strings.HasPrefix(dsn, "postgresql://") {
			return 0, errors.New("postgres_dsn_invalid")
		}
		// TLS is required for hosted databases. Local development uses a separate explicit test fixture.
		parsed, parseErr := url.Parse(dsn)
		if parseErr != nil || parsed.Query().Get("sslmode") != "verify-full" {
			return 0, errors.New("postgres_verified_tls_required")
		}
	} else if strings.HasPrefix(dsn, "file:") || strings.Contains(dsn, "\x00") || dsn == ":memory:" || strings.Contains(dsn, "?") {
		return 0, errors.New("sqlite_path_not_allowed")
	}
	db, err := sql.Open(sqlDriver, dsn)
	if err != nil {
		return 0, errors.New("database_open_failed")
	}
	db.SetMaxOpenConns(3)
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(30 * time.Minute)
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err = db.PingContext(pingCtx); err != nil {
		db.Close()
		return 0, errors.New("database_unavailable")
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	if len(h.handles) >= 8 {
		db.Close()
		return 0, errors.New("too_many_database_handles")
	}
	h.current++
	h.handles[h.current] = &handle{db: db}
	return h.current, nil
}
func (h *DBHost) acquire(id uint64) (*handle, error) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if id == 0 || h.handles[id] == nil {
		return nil, errors.New("invalid_database_handle")
	}
	return h.handles[id], nil
}
func (h *DBHost) Close(id uint64) error {
	h.mu.Lock()
	state := h.handles[id]
	delete(h.handles, id)
	h.mu.Unlock()
	if state == nil {
		return errors.New("invalid_database_handle")
	}
	if state.tx != nil {
		_ = state.tx.Rollback()
	}
	_ = state.db.Close()
	return nil
}
func (h *DBHost) CloseAll() {
	h.mu.Lock()
	ids := make([]uint64, 0, len(h.handles))
	for id := range h.handles {
		ids = append(ids, id)
	}
	h.mu.Unlock()
	for _, id := range ids {
		_ = h.Close(id)
	}
}
func (h *DBHost) Begin(ctx context.Context, id uint64) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	state := h.handles[id]
	if state == nil {
		return errors.New("invalid_database_handle")
	}
	if state.tx != nil {
		return errors.New("transaction_already_open")
	}
	tx, err := state.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return errors.New("transaction_begin_failed")
	}
	state.tx = tx
	return nil
}
func (h *DBHost) Commit(id uint64) error   { return h.finish(id, true) }
func (h *DBHost) Rollback(id uint64) error { return h.finish(id, false) }
func (h *DBHost) finish(id uint64, commit bool) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	state := h.handles[id]
	if state == nil || state.tx == nil {
		return errors.New("no_active_transaction")
	}
	tx := state.tx
	state.tx = nil
	var err error
	if commit {
		err = tx.Commit()
	} else {
		err = tx.Rollback()
	}
	if err != nil {
		return errors.New("transaction_finish_failed")
	}
	return nil
}
func sqlArgs(items []json.RawMessage) ([]any, error) {
	if len(items) > 64 {
		return nil, errors.New("too_many_parameters")
	}
	result := make([]any, 0, len(items))
	for _, raw := range items {
		var v any
		dec := json.NewDecoder(strings.NewReader(string(raw)))
		dec.UseNumber()
		if err := dec.Decode(&v); err != nil {
			return nil, errors.New("invalid_parameter")
		}
		switch x := v.(type) {
		case nil, bool:
			result = append(result, x)
		case string:
			if len(x) > 65536 {
				return nil, errors.New("parameter_too_long")
			}
			result = append(result, x)
		case json.Number:
			if i, err := x.Int64(); err == nil {
				result = append(result, i)
			} else {
				f, err := strconv.ParseFloat(string(x), 64)
				if err != nil || math.IsInf(f, 0) || math.IsNaN(f) {
					return nil, errors.New("invalid_number")
				}
				result = append(result, f)
			}
		default:
			return nil, errors.New("unsupported_parameter_type")
		}
	}
	return result, nil
}
func checkSQL(query string) error {
	if len(query) == 0 || len(query) > 65536 || strings.ContainsAny(query, "\x00") {
		return errors.New("invalid_sql")
	}
	return nil
}
func (h *DBHost) Exec(ctx context.Context, id uint64, query string, args []json.RawMessage) (int64, error) {
	if err := checkSQL(query); err != nil {
		return 0, err
	}
	params, err := sqlArgs(args)
	if err != nil {
		return 0, err
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	state := h.handles[id]
	if state == nil {
		return 0, errors.New("invalid_database_handle")
	}
	var result sql.Result
	if state.tx != nil {
		result, err = state.tx.ExecContext(ctx, query, params...)
	} else {
		result, err = state.db.ExecContext(ctx, query, params...)
	}
	if err != nil {
		return 0, errors.New("database_execution_failed")
	}
	affected, _ := result.RowsAffected()
	return affected, nil
}
func (h *DBHost) Query(ctx context.Context, id uint64, query string, args []json.RawMessage) ([]string, [][]any, error) {
	if err := checkSQL(query); err != nil {
		return nil, nil, err
	}
	params, err := sqlArgs(args)
	if err != nil {
		return nil, nil, err
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	state := h.handles[id]
	if state == nil {
		return nil, nil, errors.New("invalid_database_handle")
	}
	var rows *sql.Rows
	if state.tx != nil {
		rows, err = state.tx.QueryContext(ctx, query, params...)
	} else {
		rows, err = state.db.QueryContext(ctx, query, params...)
	}
	if err != nil {
		return nil, nil, errors.New("database_query_failed")
	}
	defer rows.Close()
	names, err := rows.Columns()
	if err != nil {
		return nil, nil, errors.New("database_columns_failed")
	}
	if len(names) > 64 {
		return nil, nil, errors.New("too_many_result_columns")
	}
	output := make([][]any, 0)
	for rows.Next() {
		if len(output) >= 500 {
			return nil, nil, errors.New("result_row_limit_exceeded")
		}
		fields := make([]any, len(names))
		dest := make([]any, len(names))
		for i := range fields {
			dest[i] = &fields[i]
		}
		if err := rows.Scan(dest...); err != nil {
			return nil, nil, errors.New("database_scan_failed")
		}
		for i, f := range fields {
			switch x := f.(type) {
			case []byte:
				if len(x) > 65536 {
					return nil, nil, errors.New("result_cell_too_large")
				}
				fields[i] = string(x)
			case string:
				if len(x) > 65536 {
					return nil, nil, errors.New("result_cell_too_large")
				}
			case nil, int64, float64, bool, time.Time:
			default:
				fields[i] = fmt.Sprint(x)
			}
		}
		output = append(output, fields)
	}
	if rows.Err() != nil {
		return nil, nil, errors.New("database_iteration_failed")
	}
	return names, output, nil
}

var _ = os.ErrNotExist
