# noqeri/hex 0.4.0 (release candidate)

This pre-1.0 package candidate is based on the earlier 1.0.0 implementation. Existing source files and tests have been retained where present, alongside a new source-import smoke fixture and this release note.

- Public entrypoint: `src/hex.nqr` (verify it matches `package.nqr`).
- License: GPL-3.0-only.
- Quality evidence: test-contract only; **not compiler/runtime verified**.
- Scope: Local library; requires execution of public API and negative/boundary tests before production use.
- Selected fixes in this candidate: core/test exports, safer standard-library pointer/output handling, bounded rate-limiter arithmetic and stricter Base64URL input validation. Packages outside those areas primarily receive consistent 0.4.0 packaging and test/documentation scaffolding, not independently verified behavior changes.
- Historical package files remain unchanged, but historical releases are **marked yanked in the candidate index**. The existing Noqeri resolver excludes yanked releases even for explicit pinned requests. Therefore pinned older installations **may break if this candidate is merged as-is**. Do not merge before implementing and verifying a backwards-compatible migration policy.

Local compile check (requires a trusted working Noqeri compiler): `noqeri check tests/release_smoke.nqr`. The candidate is not considered production-ready until these checks and behavioral fixtures pass with executable logs.
