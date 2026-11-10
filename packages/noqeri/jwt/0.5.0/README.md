# noqeri/jwt 0.5.0

Signed-algorithm allowlisting, path-safe key identifiers and bounded JWT claims-window policy (not cryptographic verification).

In addition to these functions, the full MIT 0.1.1 API is preserved. This version is experimental until the new regression cases and compatibility are executed on the native Noqeri SDK. **Never trust token contents before signature verification and issuer/audience validation by a trusted cryptographic provider.**

See `src/jwt.noqeri`, `tests/regression.noqeri`, and `tests/depth_regression.noqeri`.
