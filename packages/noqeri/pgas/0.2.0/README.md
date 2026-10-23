# noqeri/pgas 0.2.0: experimental distributed PGAS

Compatible with the Noqeri 0.1.3 development language track. This new package
release leaves prior 0.1.0 and 0.1.3 archives unchanged.

- `src/pgas.noqeri`: global-index partitioning, epoch-fenced clients,
  WAL-persistent node promotion, registered tasks and **bounded sandbox
  bytecode** (not arbitrary native code).
- `src/pgas_tls.noqeri`: mutual TLS 1.3 transport, encrypted task upload,
  remote memory operations and epoch-bearing client requests.
- `src/pgas_replication.noqeri`: synchronous two-node TLS/WAL mirroring,
  uncertain-result fencing, verified reads. This is NOT an automatic failover
  or Raft implementation.
- `src/pgas_rdma.noqeri`: optional real Linux libibverbs provider bindings.
  Exchange RDMA peer descriptors ONLY over authenticated TLS and never
  assume RDMA writes are WAL durable. Native connection setup is still C-only.

Requires the exact corresponding native libraries from Noqeri:
`noqeri_pgas_runtime`, `noqeri_pgas_tls_gateway`,
`noqeri_pgas_replication`, and optionally `noqeri_pgas_rdma`.
This is source-only registry publication: no native libraries are distributed
in this artifact, and native Noqeri linking is still an acceptance gate.

The Stage-0 compiler can validate `@partition(strategy: "block", nodes: 4)`
metadata but it cannot lower remote arrays into executable distributed
addresses. Native/interpreter/NQRI backends reject attempted local execution.
Stage-2 syntax parity, actual RDMA fabric testing, 2+ physical-host TLS
qualification, consensus membership/failover, snapshotting, retries with
durable deduplication, and production hardening remain incomplete.
