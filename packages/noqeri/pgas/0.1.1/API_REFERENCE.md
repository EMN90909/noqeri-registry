# noqeri/pgas 0.1.1 API Reference

## 10 exported functions

- pgasArrayCapacityValid
- pgasBlockLength
- pgasBlockOwner
- pgasBlockSize
- pgasBlockStart
- pgasCyclicLocalIndex
- pgasCyclicOwner
- pgasHaloValid
- pgasLocalOffset
- pgasRankValid

## 0 external host bindings


## Scope

Partitioned global address-space planning helpers for block/cyclic ownership, local indexes, halo width and guarded distributed offsets.

## Limitations

Pure distribution math: not a distributed runtime, shared-memory coherence, RPC system or MPI replacement. Network transfers and global synchronization require host primitives.
