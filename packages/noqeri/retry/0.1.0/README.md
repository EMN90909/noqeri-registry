# noqeri/retry

Portable retry policy helpers for HTTP/provider code. The package classifies common transient statuses and computes capped exponential delays without hiding sleep or I/O.

```nqr
import package "noqeri/retry"
let delay = retryDelayMillis(attempt, 100 as i64, 5000 as i64)
```
