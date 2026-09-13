# Noqeri Registry security and reproducibility policy

The registry treats a published `name@version` as immutable. A release may be **yanked** from normal resolution but its archive and checksum remain available so existing lockfiles remain reproducible.

## Integrity

Every release archive must have a canonical SHA-256 digest. The digest covers the reproducible package archive, not mutable repository metadata. Clients must verify direct and transitive dependencies before build/run. A mismatch is fatal.

The canonical lockfile records package, exact version, source and digest. Dependency resolution is deterministic: an unchanged manifest, lockfile and registry snapshot resolve to the same content.

## Offline cache

Verified archives may be stored in a content-addressed local cache. Offline builds may only use entries whose digest matches the lockfile. Cache entries are never trusted solely by filename.

## Namespace ownership

Top-level namespaces have explicit owners. Transfers require current-owner approval or an administrative recovery process with a public audit record. Namespace similarity alone never grants ownership.

## Signing

Package signing is additive to content hashing: signatures authenticate publisher identity while SHA-256 authenticates bytes. The registry stores signing-key identifiers and signature metadata separately from immutable package content so key rotation does not mutate old archives.

## Yanks and malicious packages

A yanked release remains fetchable by an existing exact lock but is excluded from new resolution. Confirmed malicious releases may be blocked from execution/download by current clients, but the transparency record retains the version hash and security disposition.

Security reports must identify package/version, evidence and reporter contact. The intended ecosystem commands are `noqeri audit` for installed dependency verification and `noqeri doctor` for local toolchain/cache health.

## Transparency service

The planned public service is `sum.noqeri.dev`. Its contract is an append-only mapping of package-version identity to canonical archive digest plus an inclusion proof/checkpoint. Until the network service exists, this repository's `transparency/` records are the auditable seed format and must never rewrite historical entries.
