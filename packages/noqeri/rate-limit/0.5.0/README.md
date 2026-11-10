# noqeri/rate-limit 0.5.0

Millisecond-accurate overflow-saturating token buckets and conservative fixed-window consumption.

In addition to these functions, the full MIT 0.1.1 API is preserved. This version is experimental until the new regression cases and compatibility are executed on the native Noqeri SDK. No process-shared atomic state or distributed rate-limit store is provided; callers must synchronize policy updates.

See `src/rate_limit.noqeri`, `tests/regression.noqeri`, and `tests/depth_regression.noqeri`.
