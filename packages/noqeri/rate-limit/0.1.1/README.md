# noqeri/rate-limit 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Fixed-window rate limit, token bucket refill and retry-after calculations using integer arithmetic and bounds-aware counters.

The new implementation exports 9 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Pure policy math, not an atomic distributed limiter. The host must perform transactional updates to counters and timestamps (or use Redis/database locks). Clock must be monotonic and trusted.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
