# noqeri/turso

Noqeri-native Turso SQL-over-HTTP adapter. Remote database URLs use HTTPS and bearer tokens; `/v2/pipeline` is used for parameterized SQL execution.

```nqr
import package "noqeri/turso"
let result = tursoQuery(databaseUrl, token, pipelineJson)
```

Prefer bound SQL parameters in the pipeline body rather than concatenating application input.
