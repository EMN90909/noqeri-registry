# noqeri/rate-limit 0.1.1 API Reference

## 9 exported functions

- rateLimitAllow
- rateLimitBurstValid
- rateLimitConfigValid
- rateLimitConservativeDelay
- rateLimitConsume
- rateLimitRefill
- rateLimitRemaining
- rateLimitRetryAfter
- rateLimitWindowStart

## 0 external host bindings


## Scope

Fixed-window rate limit, token bucket refill and retry-after calculations using integer arithmetic and bounds-aware counters.

## Limitations

Pure policy math, not an atomic distributed limiter. The host must perform transactional updates to counters and timestamps (or use Redis/database locks). Clock must be monotonic and trusted.
