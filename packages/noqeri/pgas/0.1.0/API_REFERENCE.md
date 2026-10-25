# pgas 0.1.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/pgas.noqeri
- Exported functions: 20
- Host externs: 12

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
- pgas_serve
- pgas_stop
- pgas_strategy_valid
- pgas_sync
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
- nq_pgas_server_port
- nq_pgas_server_start
- nq_pgas_server_stop
- nq_pgas_write

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
