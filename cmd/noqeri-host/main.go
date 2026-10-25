// SPDX-License-Identifier: MIT
// stdio host: never exposes privileged Noqeri services on a public port.
package main

import (
	"context"
	"github.com/EMN90909/noqeri-registry/internal/hostbridge"
	"log"
	"os"
)

func main() {
	host := hostbridge.NewEngine()
	defer host.Close()
	if err := host.Serve(context.Background(), os.Stdin, os.Stdout); err != nil {
		log.Printf("Noqeri host terminated: %v", err)
		os.Exit(1)
	}
}
