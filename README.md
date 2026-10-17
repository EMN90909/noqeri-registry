# Noqeri Registry

The official source registry for Noqeri packages. Registry runtime logic and package implementations are written in Noqeri. Operating-system I/O is reached only through explicit Noqeri ABI `extern` capabilities, so package logic is not tied to Go, C, C++, Windows, Linux, or macOS APIs.

## Run

```sh
noqeri run Programs/registry.nqr
```

The host ABI supplies package-file access and HTTP serving. Noqeri-owned code validates package names, versions, ports and package-domain rules.

## Package quality rule

A published package must contain useful exported behavior. Manifest-only packages and placeholder sources are not accepted. Host-backed packages keep validation, framing, status handling and protocol rules in Noqeri and restrict `extern` functions to the actual host capability boundary.

## License

Everything in this repository, including every package, is licensed under **GPL-3.0-only**. Package source files carry SPDX identifiers and the repository `LICENSE` contains the GPL-3.0-only notice and canonical FSF license reference.

## Local testing

GitHub Actions is intentionally not required. Run checks on your own machine with the installed Noqeri stage-0/stage-1 compiler:

```sh
noqeri check Programs/registry.nqr
noqeri check tests/registry_contracts.nqr
```

## Registry release verification (October 2026)

Use `node scripts/verify-index.mjs` to validate index schema, coordinate uniqueness, semver syntax, duplicate versions, yanked flags and canonical release paths **without network access or GitHub Actions**. This is an index-contract check, not a package execution test or authenticity proof. Also run `noqeri check Programs/registry.nqr` and `noqeri check tests/registry_contracts.nqr` with a working verified compiler and record the results before publishing.

The registry includes historical releases marked `1.0.0`; this **does not** prove the main Noqeri compiler or every package is stable or Stage-2-compatible. The package manager downloads packages and verifies SHA-256 digests against cached metadata, but end-to-end online/offline installation, dependency resolution, archive integrity, failure recovery and registry availability must be tested against actual immutable releases before announcing a stable distribution.
