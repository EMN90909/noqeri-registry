# Noqeri PGAS 0.1.5 — experimental

Builds on 0.1.4's native C ABI, local loopback transport, partitions, atomic operations and epoch fencing. Adds pure-Noqeri balanced-block and cyclic node-capacity calculations, safe local-slot index checks and bounded sandbox-policy helpers. Retains the previous public APIs and accompanying native TLS/RDMA/replication source modules.

**Provider limitations remain:** TLS/RDMA/multi-host availability must be qualified per native SDK and deployment. This package alone does not enable or attest to remote transport, security or hardware. The source regression and native host integration require independent testing; Node.js is not required.
