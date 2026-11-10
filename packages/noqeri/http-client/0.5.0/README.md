# noqeri/http-client 0.5.0

Preserves all existing 0.4.0 APIs and expands the native Noqeri implementation with 18 functions from the earlier MIT-licensed preview. Adds endpoint handling, input validation, API status, rate limits, retry guidance, and/or authenticated request helpers as applicable.

**Host boundary:** Network requests require trusted `providerHttpJson` / `providerHttpStatus` implementations. This package does not bundle a working transport, provide secure token storage, or guarantee live provider compatibility on every target. Use server-side scoped credentials; the Noqeri sources have no Node.js dependency. GPL source preserved; MIT notice for appended functions is in LICENSE-MIT. Offline regression tests are included but not executed by this release.
