# pgas 0.1.4 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/pgas.noqeri
- Exported functions: 45
- Host externs: 38

## Exported API

- pgas_add_global_i64
- pgas_add_i64
- pgas_block
- pgas_bound_port
- pgas_cas_global_i64
- pgas_cas_i64
- pgas_client_epoch
- pgas_close
- pgas_connect
- pgas_cyclic
- pgas_fence_promote
- pgas_health
- pgas_locate
- pgas_mirror_close
- pgas_mirror_open
- pgas_mirror_read_verified
- pgas_mirror_write
- pgas_partition_valid
- pgas_rdma_available
- pgas_rdma_close
- pgas_rdma_open
- pgas_rdma_read
- pgas_rdma_write
- pgas_read_global_i64
- pgas_read_i64
- pgas_remote_registered_task
- pgas_run_sandbox
- pgas_serve
- pgas_serve_durable
- pgas_stop
- pgas_strategy_valid
- pgas_sync
- pgas_tls_add_i64
- pgas_tls_cas_i64
- pgas_tls_client_epoch
- pgas_tls_close
- pgas_tls_connect
- pgas_tls_health
- pgas_tls_read_i64
- pgas_tls_registered_task
- pgas_tls_run_sandbox
- pgas_tls_sync
- pgas_tls_write_i64
- pgas_write_global_i64
- pgas_write_i64

## External host bindings required

- nq_pgas_barrier
- nq_pgas_client_close
- nq_pgas_client_connect
- nq_pgas_client_set_epoch
- nq_pgas_compare_exchange
- nq_pgas_execute_program
- nq_pgas_fetch_add
- nq_pgas_location
- nq_pgas_ping
- nq_pgas_rdma_available
- nq_pgas_rdma_close
- nq_pgas_rdma_open
- nq_pgas_rdma_read
- nq_pgas_rdma_write
- nq_pgas_read
- nq_pgas_replica_pair_close
- nq_pgas_replica_pair_create
- nq_pgas_replica_pair_read_verified
- nq_pgas_replica_pair_write
- nq_pgas_run_task
- nq_pgas_server_get_epoch
- nq_pgas_server_port
- nq_pgas_server_promote_epoch
- nq_pgas_server_start
- nq_pgas_server_start_durable
- nq_pgas_server_stop
- nq_pgas_tls_barrier
- nq_pgas_tls_client_close
- nq_pgas_tls_client_connect
- nq_pgas_tls_client_set_epoch
- nq_pgas_tls_compare_exchange
- nq_pgas_tls_execute_program
- nq_pgas_tls_fetch_add
- nq_pgas_tls_ping
- nq_pgas_tls_read
- nq_pgas_tls_run_task
- nq_pgas_tls_write
- nq_pgas_write

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
