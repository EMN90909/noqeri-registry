# noqeri/http 0.5.0

This is an expanded, Node.js-free Noqeri library release built on the MIT 0.1.1 source.

**New:** Bounded request-target validation, overflow-checked Content-Length and framing-conflict detection; HTTP server/network I/O is handled by an external runtime.

See `src/http.noqeri`, `tests/regression.noqeri` and `tests/depth_regression.noqeri`.

**Quality:** experimental until compiled and runtime-tested against the current native Noqeri SDK. This version preserves the older 0.1.1 exports and does not claim production readiness.
