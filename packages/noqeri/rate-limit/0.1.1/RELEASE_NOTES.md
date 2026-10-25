# 0.1.1 release: noqeri/rate-limit

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Pure policy math, not an atomic distributed limiter. The host must perform transactional updates to counters and timestamps (or use Redis/database locks). Clock must be monotonic and trusted.
