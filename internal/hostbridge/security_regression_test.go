// SPDX-License-Identifier: MIT
package hostbridge

import (
    "context"
    "errors"
    "strings"
    "testing"
)

func TestHostErrorRedactionDoesNotLeakUnknownMessages(t *testing.T) {
    for _, source := range []string{
        "password=real-pass",
        "token=sk_test_very_secret",
        "postgres connection to private-db.internal failed",
        "secret",
        "invalid_sql password=leaked",
    } {
        if result := safeError(errors.New(source)); result != "operation_failed" {
            t.Errorf("unrecognized message was exposed: %q -> %q", source, result)
        }
    }
    if result := safeError(errors.New("invalid_sql")); result != "invalid_sql" {
        t.Fatalf("lost documented safe error code: %s", result)
    }
    if result := safeError(context.DeadlineExceeded); result != "timeout" {
        t.Fatalf("deadline should remain distinguishable: %s", result)
    }
    if result := safeError(context.Canceled); result != "cancelled" {
        t.Fatalf("cancellation should remain distinguishable: %s", result)
    }
    if strings.Contains(safeError(errors.New("password=short")), "password") {
        t.Fatal("secret-bearing text leaked through IPC")
    }
}
