test:
	go test ./...

run:
	go run ./cmd/registry -root . -listen :8080

