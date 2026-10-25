# noqeri/rate-limit

Pure token-bucket policy helpers. Storage and clocks stay explicit so the same code can be used in a single process, Redis/Upstash-backed service, or another shared store.

```noqeri
import package "noqeri/rate-limit"
let tokens = rateLimitRefill(current, 100 as i64, elapsed, 10 as i64)
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
