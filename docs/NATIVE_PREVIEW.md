# Native Noqeri Registry preview

The native program is **Noqeri-authored** (`Programs/registry.noqeri`, `src/registry.noqeri`) with an experimental C++17 Linux/POSIX system host (`native/`). The C++ host implements OS sockets, JSON serialization, files, deterministic gzip/tar and SHA-256. HTTP route selection, method and URI validation, identity validation, search limits and pagination guards are exported by compiled Noqeri code.

It does **not** use Node, npm, V8, or JavaScript at runtime.

## Run a read-only local preview

Requires Linux x86-64, the **Stage-0 Noqeri compiler**, `c++`, `pkg-config`, `libjson-c-dev`, `libssl-dev`, and `zlib1g-dev`.

```sh
NOQERI_COMPILER=/absolute/path/to/noqeri make native
REGISTRY_SOURCE_INDEX_PREVIEW=1 REGISTRY_ROOT="$PWD" PORT=8080 ./build/native/noqeri-registry
```

The startup environment switch is **mandatory**. The host reads the committed `registry/index.json` and package source directories, validates archive manifests and file bounds, and creates SHA-256-verified `.nqpkg` archives in a bounded in-memory cache. It serves the Registry v1 read-only HTTP routes, including version metadata, search, advisories and archive downloads. Historical yanked versions cannot be downloaded.

This is explicitly a **source-index preview**, not a production replacement for the existing live NoeSQL-backed runtime. It does not read `registry.noedb`, preserve live download counters, authenticate publishers, publish packages, or attach to native NoeSQL transactions. The native NoeSQL Rust/Zig session bridge and production crash/concurrency qualification still need an integration test before the JavaScript transport can safely be retired from the deployed database-backed service. Do not point production package clients at this preview.

Server bind defaults to **127.0.0.1**. Set `REGISTRY_HOST=0.0.0.0` only behind an appropriate proxy and TLS termination. `PORT=0` requests an ephemeral local port for tests. The server is intentionally bounded and single-connection-at-a-time; no production throughput claim is made.

## Tests

```sh
NOQERI_COMPILER=/absolute/path/to/noqeri make native-test
```

The native integration suite launches the actual compiled Noqeri program and verifies route behavior, `GET`/`HEAD`, pagination and artifact digest. No JavaScript or mock route classifier is used in this gate. The public GitHub workflow separately exercises the legacy NoeSQL transport contracts until the native replacement reaches feature parity.

### Porting boundary

- Noqeri: registry entry, policy, method/path routing, semantic validation.
- C++: platform I/O, metadata serialization and deterministic archive generation.
- NoeSQL: future native read/write source of truth; **not integrated with this preview**.

Canonical package source files use `.noqeri` and portable bytecode uses `.nqri`. Historical `.noqeri` files remain immutable artifacts.
