package main

import (
    "flag"
    "log"
    "net/http"
    "time"

    "github.com/EMN90909/noqeri-registry/internal/registry"
)

func main() {
    root := flag.String("root", ".", "registry data root")
    listen := flag.String("listen", ":8080", "HTTP listen address")
    flag.Parse()
    catalog, err := registry.Open(*root)
    if err != nil { log.Fatalf("open catalog: %v", err) }
    server := &http.Server{Addr:*listen, Handler:registry.NewHandler(catalog), ReadHeaderTimeout:5*time.Second, ReadTimeout:15*time.Second, WriteTimeout:30*time.Second, IdleTimeout:60*time.Second, MaxHeaderBytes:16<<10}
    log.Printf("noqeri public registry listening on %s", *listen)
    log.Fatal(server.ListenAndServe())
}

