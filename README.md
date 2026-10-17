# Noqeri Registry

Official Noqeri source package registry, GPL-3.0-only.

## Package release: 0.4.0 (candidate)

All **54 packages** have candidate 0.4.0 directories on the `release/0.4.0-package-refresh` branch. Every package carries a manifest, source entrypoint, release notes and a source-import smoke fixture. Existing package sources and earlier historical versions are preserved. Selected utility defects have been addressed in this release candidate (core/test exports, pointer-safe standard-library math outputs, bounded token refill arithmetic and stricter Base64URL padding validation).

**Version policy:** historic 1.x entries are yanked in the candidate index, not deleted, so the package manager's default highest-non-yanked selection will choose 0.4.0. This is a deliberate compatibility transition and **may break existing users**; it must be reviewed before merging into main. Pin previous versions explicitly if necessary.

**Not production certified:** Noqeri's current compiler has not been fully bootstrapped or executed against these 54 packages. Source-level and index checks cannot replace compiler execution, memory checks, host integration tests or release signing. Provider SDK integrations remain experimental where the catalog marks them so.

## Local verification

```sh
node scripts/verify-index.mjs
node scripts/verify-v040.mjs
NOQERI_BIN=/path/to/noqeri node scripts/check-all-v040.mjs
```

The first two are offline Node.js checks; the third requires a trusted, working Noqeri compiler and must fail if unavailable. No GitHub Actions are required.
