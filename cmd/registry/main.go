package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/EMN90909/noqeri-registry/internal/registry"
)

func main() {
	root := os.Getenv("REGISTRY_ROOT")
	if root == "" {
		root = "."
	}
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":8080"
	}

	handler, err := registry.New(root)
	if err != nil {
		log.Fatal(err)
	}

	server := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("noqeri registry listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}
