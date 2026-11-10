# noqeri/stripe v0.5.0 — expanded API

This version preserves the 0.4.0 exported functions, and restores 30 additional, implemented native Noqeri functions from the earlier MIT-licensed 0.1.1 preview. The old source remains under GPL-3.0-only; additional code retains its MIT attribution in LICENSE-MIT.

The package provides validated request helpers, additional endpoint builders, retry and status policy, and credential boundary guards. The external `providerHttpJson` and `providerHttpStatus` hooks require a trusted host implementation. **Publishing these adapters does not independently add an HTTPS host or make authenticated API calls work in every Noqeri runtime.** Credentials must be stored in the trusted host, never embedded in client-side source.

The 0.1.1 offline regression checks are included and target the expanded APIs. Compiler execution and authenticated live-provider integration still require independent testing.
