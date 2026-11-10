# noqeri/security 0.5.0

The default package entry consolidates the previously separate memory and validation APIs with 7 additional Noqeri security-policy helpers. Existing files `src/memory.noqeri` and `src/validation.noqeri` are retained for direct imports. This release deliberately changes the package entry to `src/security.noqeri` to expose useful operations together.

Memory zeroization requires a native compiler that preserves volatile writes; password policy checks do not replace a password hashing service; constant-time comparisons do not imply cryptographic verification. No Node.js runtime is needed. GPL-3.0-only original source plus MIT supplements (LICENSE-MIT). Regression source included but not executed here.
