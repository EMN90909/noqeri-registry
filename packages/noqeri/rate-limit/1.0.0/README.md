# noqeri/rate-limit

Pure token-bucket policy helpers. Storage and clocks stay explicit so the same code can be used in a single process, Redis/Upstash-backed service, or another shared store.

```nqr
import package "noqeri/rate-limit"
let tokens = rateLimitRefill(current, 100 as i64, elapsed, 10 as i64)
```
