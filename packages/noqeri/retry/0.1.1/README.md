# noqeri/retry 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Bounded exponential backoff, retry policy, deterministic jitter range, deadline guard, status classification and max-attempt enforcement.

The new implementation exports 11 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Does not schedule asynchronous operations or implement wall-clock timers. Host decides which non-idempotent side effects are safe to retry. Jitter is a bound, not generated cryptographically.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
