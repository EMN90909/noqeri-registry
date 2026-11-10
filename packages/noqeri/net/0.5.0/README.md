# noqeri/net 0.5.0

This release retains the existing 0.4.0 functions and adds 7 native Noqeri functions from the MIT 0.1.1 implementation. Security bounds, validated operations and expanded native integration surface are preserved. GPL-3.0-only original implementation and MIT supplements (LICENSE-MIT) are included.

Any host externs still require a compatible native driver/provider, with no automatic fallback to a JavaScript or Node.js runtime. Source regressions are included but not executed in this release. Real database, socket and CLI integrations need runtime tests before production use.
