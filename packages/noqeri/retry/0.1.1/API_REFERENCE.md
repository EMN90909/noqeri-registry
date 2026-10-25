# noqeri/retry 0.1.1 API Reference

## 11 exported functions

- retryAfterSecondsValid
- retryAllowed
- retryBudgetRemaining
- retryConfigValid
- retryDeadlineAllows
- retryDelayMs
- retryHttpStatus
- retryJitterLower
- retryJitterUpper
- retryMethodSafe
- retryNetworkError

## 0 external host bindings


## Scope

Bounded exponential backoff, retry policy, deterministic jitter range, deadline guard, status classification and max-attempt enforcement.

## Limitations

Does not schedule asynchronous operations or implement wall-clock timers. Host decides which non-idempotent side effects are safe to retry. Jitter is a bound, not generated cryptographically.
