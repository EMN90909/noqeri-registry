#!/bin/sh
# Start the Go transport with Noqeri policy sources (no Node/Python/C++ host).
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"
exec go run ./cmd/registry -root .
