# noqeri/clerk 0.4.0

This is a **pre-1.0 release** of the existing clerk package, based on the 1.0.0 source line.

- Entry: `src/clerk.nqr`.
- License: GPL-3.0-only.
- Support: Experimental integration; needs an explicitly configured host/provider and service-level tests.
- Historical packages remain in the repository for reproducibility. The index marks former 1.x releases as yanked so new unpinned installations resolve to 0.4.0. Previously pinned installs can continue resolving historical versions.
- The package source and existing tests were retained; added a minimal source-import smoke fixture. Passing static checks does **not** prove execution, ABI compatibility or security assurance.

Run a real package test with a trusted Noqeri compiler: `noqeri check tests/release_smoke.nqr`. Run all provided package tests before publishing production binaries.
