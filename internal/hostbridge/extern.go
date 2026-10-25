// SPDX-License-Identifier: MIT
package hostbridge

import (
	"context"
	"net/url"
	"strconv"
)

// InvokeNoqeriExtern is the mapping an ABI-v2 service callback can invoke.
// It bridges existing symbol names to the bounded Go runtime, but does not
// claim that the Stage-0 interpreter automatically registers these services.
func (e *Engine) InvokeNoqeriExtern(ctx context.Context, symbol string, args []string) Result {
	response := Result{Version: 1}
	switch symbol {
	case "providerHttpStatus":
		if len(args) != 0 {
			response.Error = "invalid_argument_count"
			return response
		}
		response.OK = true
		response.Status = e.LastHTTPStatus()
		response.Body = strconv.Itoa(response.Status)
		return response
	case "providerHttpJson":
		if len(args) != 7 {
			response.Error = "invalid_argument_count"
			return response
		}
		// Args 2 and 3 contain the source SDK's authentication proposal. Those
		// values are deliberately ignored; only server-side configured secrets
		// can authenticate a request. Args 4/5 cannot inject arbitrary headers.
		parsed, err := url.Parse(args[1])
		if err != nil {
			response.Error = "invalid_url"
			return response
		}
		provider := ""
		for name := range providerHosts {
			if allowedHost(name, parsed.Hostname()) {
				provider = name
				break
			}
		}
		if provider == "" {
			response.Error = "provider_host_not_allowed"
			return response
		}
		return e.Dispatch(ctx, Message{Version: 1, Op: "http", Provider: provider, Method: args[0], URL: args[1], Body: args[6]})
	case "noqeriDbOpen", "sqliteOpen":
		if len(args) != 1 {
			response.Error = "invalid_argument_count"
			return response
		}
		// An untrusted source path may not select a DSN: db_open uses only the
		// server's own NOQERI_POSTGRES_DSN / NOQERI_SQLITE_PATH.
		driver := "postgres"
		if symbol == "sqliteOpen" {
			driver = "sqlite"
		}
		return e.Dispatch(ctx, Message{Version: 1, Op: "db_open", Driver: driver})
	case "noqeriDbClose", "sqliteClose":
		if len(args) != 1 {
			response.Error = "invalid_argument_count"
			return response
		}
		id, err := strconv.ParseUint(args[0], 10, 64)
		if err != nil {
			response.Error = "invalid_database_handle"
			return response
		}
		return e.Dispatch(ctx, Message{Version: 1, Op: "db_close", Handle: id})
	case "noqeriDbExecute", "sqliteExecute":
		if len(args) != 2 {
			response.Error = "invalid_argument_count"
			return response
		}
		id, err := strconv.ParseUint(args[0], 10, 64)
		if err != nil {
			response.Error = "invalid_database_handle"
			return response
		}
		return e.Dispatch(ctx, Message{Version: 1, Op: "db_exec", Handle: id, Query: args[1]})
	default:
		response.Error = "unregistered_extern"
		return response
	}
}
