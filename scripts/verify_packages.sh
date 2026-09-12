#!/usr/bin/env sh
set -eu
compiler="${1:-/tmp/Noqeri/build/noqeri}"
count=0
find packages -path '*/1.0.0/package.nqr' -print | sort | while IFS= read -r manifest; do
  dir=$(dirname "$manifest")
  entry=$(sed -n 's/.*entry:[[:space:]]*"\([^"]*\)".*/\1/p' "$manifest" | head -n1)
  if [ -z "$entry" ]; then
    echo "missing entry in $manifest" >&2
    exit 1
  fi
  echo "check $dir/$entry"
  "$compiler" check "$dir/$entry" >/dev/null
done
echo "Noqeri 1.0 package entrypoints compile"
