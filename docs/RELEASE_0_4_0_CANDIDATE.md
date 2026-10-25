# ARCHIVED RELEASE PROCEDURE

The commands below reference removed Node.js scripts and must not be executed. The current Go + Noqeri toolchain uses `make test`, `make verify`, and `make check-noqeri`. This release note is retained only as historical context.

# 0.4.0 registry refresh — release candidate

**Not published as stable.** Inventory: 54 existing packages, each with a 0.4.0 manifest, source entrypoint, release notes and a smoke fixture; existing package files are retained. Provider packages keep experimental markings. Quality level is experimental and evidence is test-contract only until real compiler results exist.

## Implementation hardening

- `noqeri/core`: previously private basic helpers exported.
- `noqeri/test`: assert helper made public.
- `noqeri/std`: checked arithmetic avoids dereferencing null outputs; overflow preflight uses a conservative signed-63-bit portable bound; list helpers guard null list pointers.
- `noqeri/rate-limit`: overflow-resistant saturating refill and bounded retry-after calculation.
- `noqeri/security`: new null-aware volatile memory clearing operation, with regression fixture.\n- `noqeri/base64`: strict Base64URL rejects standard '+'/'/' and inappropriate padding.
- All other packages: retained existing implementation and tests; added consistent 0.4.0 manifests, source-import smoke checks and notes. **No claim that all 54 sources were materially improved or executed.**

## Important migration blocker

Previous versions 1.0.0/1.5.0/1.6.0 are preserved on disk but marked yanked in the **candidate index** to make 0.4.0 the only non-yanked version. The current Noqeri package resolver filters yanked versions for both implicit and explicit version requests. This can break historical pinned dependencies. **Do not merge without ensuring exact pinned historical versions remain installable, or choose a non-breaking version selection design.**

## Qualification checklist

1. Run offline `node scripts/verify-index.mjs` and `node scripts/verify-v040.mjs`.
2. Build a verified Noqeri toolchain and run `NOQERI_BIN=... node scripts/check-all-v040.mjs` for all 54 package entrypoints.
3. Execute the new negative/boundary regression fixtures, plus existing package tests, against a known compiler ABI.
4. Validate provider packages using real host interfaces with isolated credentials and mocked failure paths.
5. Exercise lockfiles and historical version pins through the actual Noqeri package manager.
6. Publish evidence: compiler hash, OS/architecture, per-package pass/fail logs, and dependency integrity results.

### Evidence collected so far

GitHub source-tree inspection confirms 54 package coordinates, 0.4.0 manifests, source entrypoints, smoke fixtures and release notes. The local environment could not clone the entire repository or obtain a trusted compiler seed. **No full package execution, native ABI test or real network integration is verified.** Never label this candidate stable or production hardened until the above passes.
