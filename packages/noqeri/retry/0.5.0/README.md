# noqeri/retry 0.5.0

This is an expanded, Node.js-free Noqeri library release built on the MIT 0.1.1 source.

**New:** Deterministic bounded jitter, replay/idempotency policy and deadline checks; call-site must implement timers and transport.

See `src/retry.noqeri`, `tests/regression.noqeri` and `tests/depth_regression.noqeri`.

**Quality:** experimental until compiled and runtime-tested against the current native Noqeri SDK. This version preserves the older 0.1.1 exports and does not claim production readiness.
