# noqeri/core 0.5.0

Overlap-safe in-place byte moves, reversal and full-length secret-content comparison policy.

The older 0.1.1 exports are retained. This release is experimental and **not verified on native Noqeri platforms**. The byte comparison guarantees a full byte loop in source, not a proven constant-time native binary.

See `src/core.noqeri`, `tests/regression.noqeri`, and `tests/depth_regression.noqeri`.
