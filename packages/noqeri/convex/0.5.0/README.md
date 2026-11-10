# noqeri/convex 0.5.0

Retains all earlier v0.4.0 functions and implements 21 further Noqeri API methods from the separately authored v0.1.1 preview: endpoint builders, HTTP status/retry policy, identifier checks, and bounded provider request helpers.

The external `providerHttpJson` and `providerHttpStatus` hooks must be supplied by a trusted native host. **This is not a standalone networking backend or a guarantee of live provider support.** Never embed private API keys in browser code. Existing GPL-3.0-only code is preserved, with MIT-sourced new functions and their license notice in LICENSE-MIT. Regression examples are included; live integration and compiler tests have not yet been run.
