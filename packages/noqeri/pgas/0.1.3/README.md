# noqeri/pgas 0.1.3

Experimental PGAS bindings for the Noqeri **0.1.3** development track.

Sources:
- `src/pgas.noqeri`: block/cyclic partitioning, global-index routing, i64 remote reads/writes/CAS/add, local durable WAL node startup, registered worker task RPC.
- `src/pgas_tls.noqeri`: TLS 1.3/mTLS client operations and allowed registered worker tasks.

These are Noqeri FFI declarations. The application must compile/link the
matching native `noqeri_pgas_runtime` and `noqeri_pgas_tls_gateway` libraries
itself; there is no binary download or automatic linkage in this package.

The legacy server binds only to loopback and uses a plaintext token. Cross-host
access is only through the certificate-authenticated TLS gateway; do not expose
raw PGAS TCP across a network. Local WAL crash recovery is **not replicated
failover**. RDMA, global barriers, compiler partition attribute lowering and
arbitrary uploaded executable tasks are **not implemented**.

This is registry source/catalog registration, not verified public publication,
native Noqeri-linked executable qualification or a production PGAS release.
