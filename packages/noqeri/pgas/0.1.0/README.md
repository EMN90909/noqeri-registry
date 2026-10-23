# noqeri/pgas 0.1.0 (experimental)

An opt-in PGAS address mapping and native FFI adapter for Noqeri programs.
This is a **developer preview, not a multi-machine PGAS framework**.

Provides deterministic block/cyclic partition ownership, node-local i64
read/write/CAS/fetch-add via the native runtime in `EMN90909/Noqeri`,
node-local barriers, and ping status. Compile/link the host library
`noqeri_pgas_runtime` with your application; this package does not bundle
native binaries or automatically load the ABI. Server setup is a native C API
(`nq_pgas_server_start`); Noqeri can connect via `nq_pgas_client_connect`.

Only local loopback TCP is permitted. Multi-host use, TLS, RDMA, fault-tolerant
recovery, and arbitrary remote task submission remain unimplemented. See
`Noqeri/Doc/PGAS.md`. The historic registry catalog is not a live-public
publication guarantee.
