package main

import (
 "flag"
 "log"
 "net/http"
 "os"
 "path/filepath"
 "time"

 "github.com/EMN90909/noqeri-registry/internal/registry"
)

func main() {
 root := flag.String("root", ".", "registry repository root")
 addr := flag.String("listen", "", "HTTP listen address (defaults to :PORT or :8080)")
 flag.Parse()
 if *addr == "" {
  port := os.Getenv("PORT")
  if port == "" { port = "8080" }
  *addr = ":" + port
 }
 abs, err := filepath.Abs(*root)
 if err != nil { log.Fatal(err) }
 catalog, err := registry.Open(abs)
 if err != nil { log.Fatal(err) }
 srv := &http.Server{
  Addr: *addr, Handler: registry.NewHandler(catalog),
  ReadHeaderTimeout: 8*time.Second, ReadTimeout: 12*time.Second,
  WriteTimeout: 40*time.Second, IdleTimeout: 30*time.Second,
  MaxHeaderBytes: 16 << 10,
 }
 log.Printf("Noqeri registry (Go transport + Noqeri policies) on %s; source-index read-only mode", *addr)
 log.Fatal(srv.ListenAndServe())
}
