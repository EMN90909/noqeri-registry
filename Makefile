.PHONY: build run test verify audit check-noqeri host host-test clean

NOQERI_COMPILER ?= noqeri

build:
	go build -trimpath -o build/noqeri-registry ./cmd/registry

run:
	go run ./cmd/registry -root .

test:
	go test ./...

host:
	go run -tags dbdrivers ./cmd/noqeri-host

host-test:
	go test -tags dbdrivers ./internal/hostbridge ./cmd/noqeri-host -count=1

verify:
	go run ./cmd/registryctl -root . verify

audit:
	go run ./cmd/registryctl -root . audit

check-noqeri:
	$(NOQERI_COMPILER) check Programs/registry.noqeri
	$(NOQERI_COMPILER) check tests/registry_contracts.noqeri

clean:
	rm -rf build/
