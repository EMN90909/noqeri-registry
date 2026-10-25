// SPDX-License-Identifier: MIT
// A bounded, credential-isolated host boundary for Noqeri's experimental extern services.
package hostbridge

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"
)

const maxFrame = (2 << 20)

// Message is the versioned IPC protocol. Credentials are NEVER passed in messages;
// server-side NOQERI_* environment variables hold the secrets.
type Message struct {
	Version   int               `json:"v"`
	ID        string            `json:"id,omitempty"`
	Op        string            `json:"op"`
	Provider  string            `json:"provider,omitempty"`
	Method    string            `json:"method,omitempty"`
	URL       string            `json:"url,omitempty"`
	Body      string            `json:"body,omitempty"`
	Driver    string            `json:"driver,omitempty"`
	Handle    uint64            `json:"handle,omitempty"`
	Query     string            `json:"query,omitempty"`
	Args      []json.RawMessage `json:"args,omitempty"`
	Symbol    string            `json:"symbol,omitempty"`
	Arguments []string          `json:"arguments,omitempty"`
	Signature string            `json:"signature,omitempty"`
}
type Result struct {
	Version  int      `json:"v"`
	ID       string   `json:"id,omitempty"`
	OK       bool     `json:"ok"`
	Status   int      `json:"status,omitempty"`
	Body     string   `json:"body,omitempty"`
	Handle   uint64   `json:"handle,omitempty"`
	Affected int64    `json:"affected,omitempty"`
	Columns  []string `json:"columns,omitempty"`
	Rows     [][]any  `json:"rows,omitempty"`
	Error    string   `json:"error,omitempty"`
}

type EnvFunc func(string) string

// Engine is safe for a single request-processing stream and concurrent HTTP calls.
type Engine struct {
	Env        EnvFunc
	HTTP       *HTTPHost
	DB         *DBHost
	mu         sync.Mutex
	lastStatus int
}

func NewEngine() *Engine              { return &Engine{Env: os.Getenv, HTTP: NewHTTPHost(), DB: NewDBHost()} }
func (e *Engine) LastHTTPStatus() int { e.mu.Lock(); defer e.mu.Unlock(); return e.lastStatus }
func (e *Engine) Dispatch(ctx context.Context, m Message) Result {
	result := Result{Version: 1, ID: m.ID}
	if m.Version != 1 {
		result.Error = "unsupported_protocol"
		return result
	}
	if len(m.ID) > 128 {
		result.Error = "invalid_id"
		return result
	}
	var err error
	switch m.Op {
	case "invoke":
		output := e.InvokeNoqeriExtern(ctx, m.Symbol, m.Arguments)
		output.ID = m.ID
		return output
	case "stripe_verify_webhook":
		if err = VerifyStripeSignature(m.Body, m.Signature, e.Env("NOQERI_STRIPE_WEBHOOK_SECRET"), time.Now()); err == nil {
			result.OK = true
		}
	case "ping":
		result.OK = true
		result.Body = "pong"
		return result
	case "http":
		result.Status, result.Body, err = e.HTTP.Execute(ctx, m, e.Env)
		e.mu.Lock()
		e.lastStatus = result.Status
		e.mu.Unlock()
	case "http_status":
		result.Status = e.LastHTTPStatus()
		result.OK = true
		return result
	case "db_open":
		result.Handle, err = e.DB.Open(ctx, m.Driver, e.Env)
	case "db_close":
		err = e.DB.Close(m.Handle)
	case "db_query":
		result.Columns, result.Rows, err = e.DB.Query(ctx, m.Handle, m.Query, m.Args)
	case "db_exec":
		result.Affected, err = e.DB.Exec(ctx, m.Handle, m.Query, m.Args)
	case "db_begin":
		err = e.DB.Begin(ctx, m.Handle)
	case "db_commit":
		err = e.DB.Commit(m.Handle)
	case "db_rollback":
		err = e.DB.Rollback(m.Handle)
	default:
		result.Error = "unknown_operation"
		return result
	}
	if err != nil {
		result.Error = safeError(err)
		return result
	}
	result.OK = true
	return result
}
func safeError(err error) string {
	switch {
	case errors.Is(err, context.DeadlineExceeded):
		return "timeout"
	case errors.Is(err, context.Canceled):
		return "cancelled"
	default:
		// Returned errors must be deliberately non-sensitive, never underlying driver/URL/credential errors.
		code := err.Error()
		if len(code) > 90 {
			return "operation_failed"
		}
		return code
	}
}
func (e *Engine) Close() { e.DB.CloseAll() }

// Serve uses an NDJSON protocol with a 2MiB frame cap and never logs secrets.
// A malformed message receives an error; the process keeps serving later messages.
func (e *Engine) Serve(ctx context.Context, reader io.Reader, writer io.Writer) error {
	in := bufio.NewScanner(reader)
	in.Buffer(make([]byte, 64*1024), maxFrame)
	out := bufio.NewWriter(writer)
	for in.Scan() {
		data := in.Bytes()
		var req Message
		var resp Result
		decoder := json.NewDecoder(strings.NewReader(string(data)))
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&req); err != nil {
			resp = Result{Version: 1, Error: "invalid_request"}
		} else {
			deadline, cancel := context.WithTimeout(ctx, 12*time.Second)
			resp = e.Dispatch(deadline, req)
			cancel()
		}
		bytes, err := json.Marshal(resp)
		if err != nil {
			return fmt.Errorf("response_encoding_failed")
		}
		if _, err = out.Write(bytes); err != nil {
			return err
		}
		if err = out.WriteByte('\n'); err != nil {
			return err
		}
		if err = out.Flush(); err != nil {
			return err
		}
	}
	if err := in.Err(); err != nil {
		return errors.New("frame_too_large_or_input_failed")
	}
	return nil
}
