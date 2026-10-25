#!/bin/sh
# Launch compiled Noqeri registry without Node.js or JavaScript.
# This is the read-only source-index mode, not the NoeSQL publication service.
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
: "${PORT:=8080}"
case "$PORT" in ''|*[!0-9]*) echo "PORT must be a number" >&2; exit 2;; esac
if [ "$PORT" -gt 65535 ]; then echo "PORT out of range" >&2; exit 2; fi
if [ ! -x "$root/build/native/noqeri-registry" ]; then
  sh "$root/scripts/build-native.sh"
fi
export PORT REGISTRY_ROOT="$root" REGISTRY_SOURCE_INDEX_PREVIEW=1
exec "$root/build/native/noqeri-registry"
