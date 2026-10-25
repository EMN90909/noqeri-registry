# noqeri/retry

Portable retry policy helpers for HTTP/provider code. The package classifies common transient statuses and computes capped exponential delays without hiding sleep or I/O.

```noqeri
import package "noqeri/retry"
let delay = retryDelayMillis(attempt, 100 as i64, 5000 as i64)
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
