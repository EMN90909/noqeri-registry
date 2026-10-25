# noqeri/pgas 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Partitioned global address-space planning helpers for block/cyclic ownership, local indexes, halo width and guarded distributed offsets.

The new implementation exports 10 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Pure distribution math: not a distributed runtime, shared-memory coherence, RPC system or MPI replacement. Network transfers and global synchronization require host primitives.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
