# 0.1.1 release: noqeri/retry

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Does not schedule asynchronous operations or implement wall-clock timers. Host decides which non-idempotent side effects are safe to retry. Jitter is a bound, not generated cryptographically.
