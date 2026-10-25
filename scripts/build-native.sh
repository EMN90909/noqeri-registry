#!/usr/bin/env sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
compiler=${NOQERI_COMPILER:-noqeri}
out=${REGISTRY_BUILD_DIR:-"$root/build/native"}
mkdir -p "$out"
"$compiler" build "$root/Programs/registry.noqeri" "$out/registry.s" -O3
"${CXX:-c++}" -c "$out/registry.s" -o "$out/registry-noqeri.o"
"${CXX:-c++}" -std=c++17 -O2 -Wall -Wextra -Wno-deprecated-declarations \
    "$root/native/main.cpp" "$root/native/registry_host.cpp" "$out/registry-noqeri.o" \
    -o "$out/noqeri-registry" \
    $(pkg-config --cflags --libs json-c openssl zlib)
printf '%s\n' "$out/noqeri-registry"
