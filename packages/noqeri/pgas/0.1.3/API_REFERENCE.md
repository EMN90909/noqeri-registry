# pgas 0.1.3 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/pgas.noqeri
- Exported functions: 31
- Host externs: 23

## Exported API

- pgas_add_global_i64
- pgas_add_i64
- pgas_block
- pgas_bound_port
- pgas_cas_global_i64
- pgas_cas_i64
- pgas_close
- pgas_connect
- pgas_cyclic
- pgas_health
- pgas_locate
- pgas_partition_valid
- pgas_read_global_i64
- pgas_read_i64
- pgas_remote_registered_task
- pgas_serve
- pgas_serve_durable
- pgas_stop
- pgas_strategy_valid
- pgas_sync
- pgas_tls_add_i64
- pgas_tls_cas_i64
- pgas_tls_close
- pgas_tls_connect
- pgas_tls_health
- pgas_tls_read_i64
- pgas_tls_registered_task
- pgas_tls_sync
- pgas_tls_write_i64
- pgas_write_global_i64
- pgas_write_i64

## External host bindings required

- nq_pgas_barrier
- nq_pgas_client_close
- nq_pgas_client_connect
- nq_pgas_compare_exchange
- nq_pgas_fetch_add
- nq_pgas_location
- nq_pgas_ping
- nq_pgas_read
- nq_pgas_run_task
- nq_pgas_server_port
- nq_pgas_server_start
- nq_pgas_server_start_durable
- nq_pgas_server_stop
- nq_pgas_tls_barrier
- nq_pgas_tls_client_close
- nq_pgas_tls_client_connect
- nq_pgas_tls_compare_exchange
- nq_pgas_tls_fetch_add
- nq_pgas_tls_ping
- nq_pgas_tls_read
- nq_pgas_tls_run_task
- nq_pgas_tls_write
- nq_pgas_write

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
