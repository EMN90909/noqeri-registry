# noqeri/pgas 0.1.4 (experimental)

Bindings for Noqeri language 0.1.3 native PGAS preview, matching the
Noqeri PGAS distributed expansion merged in October 2026.

- `src/pgas.noqeri`: block/cyclic partition placement, global-address
  accessors, node lifecycle, registered tasks and bounded sandbox program RPC.
- `src/pgas_tls.noqeri`: mutually authenticated TLS 1.3 gateway client.
- `src/pgas_rdma.noqeri`: optional genuine Linux libibverbs RC endpoint
  setup and one-sided i64 reads/writes. RDMA requires real hardware and
  secure out-of-band endpoint exchange; no pretend TCP fallback.
- `src/pgas_replication.noqeri`: synchronous two-node TLS mirror. It
  requires WAL-durable servers and externally verified leader fencing.
  Automatic split-brain-safe failover is not provided.

This is source-only metadata. Native binaries are not bundled. Consumers
must explicitly link matching `noqeri_pgas_runtime`,
`noqeri_pgas_tls_gateway`, `noqeri_pgas_rdma` and
`noqeri_pgas_replication` libraries, as needed.

Stage-0 accepts `@partition` and preserves typed metadata, but execution
fails closed until genuine distributed-memory allocation/lowering is
implemented. Noqeri's trusted Stage-1 seed remains historically pinned.
There is no independent two-NIC or physical-machine certification.

No existing `0.1.0` or `0.1.3` release bytes were rewritten.
