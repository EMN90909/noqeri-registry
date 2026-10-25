# noqeri/turso

Noqeri-native Turso SQL-over-HTTP adapter. Remote database URLs use HTTPS and bearer tokens; `/v2/pipeline` is used for parameterized SQL execution.

```noqeri
import package "noqeri/turso"
let result = tursoQuery(databaseUrl, token, pipelineJson)
```

Prefer bound SQL parameters in the pipeline body rather than concatenating application input.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
