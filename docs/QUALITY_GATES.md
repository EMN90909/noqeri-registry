# Noqeri Registry Quality Gates

The registry rewards packages that are useful, testable, teachable, compatible and supportable rather than packages that merely occupy a namespace.

## Official package quality levels

Every published package version has one explicit level. A provider stub must never be labelled `stable` or `core`.

### experimental

For exploration. APIs may change without migration guarantees. Minimum: valid manifest, real source (not filler), license, bounded package size, and a clear statement of what works and what does not.

### preview

For real evaluation. Requires meaningful implementation, input validation, automated tests, at least one runnable example, documented error behaviour, and an explicit supported target/compiler range. Breaking changes are allowed but require release notes.

### stable

For normal production use. Requires preview evidence plus negative/failure tests, compatibility-matrix passes for every claimed supported Noqeri release, versioned API notes, deprecation policy, security notes for sensitive packages, and reproducible performance methodology when performance is part of the package's purpose. A stable package cannot be a provider-shaped stub.

### core

For ecosystem-critical packages whose compatibility/support burden is intentionally higher. Requires stable evidence plus multiple release cycles of compatibility, maintained security response, migration coverage for deprecations, deterministic/offline install evidence, and explicit maintainership. `core` is a support promise, not a popularity badge.

## Depth rule

Source size is a signal, not a quality target. A package is rejected from stable/core status if it is made artificially large through aliases, duplicate wrappers, repeated constants, generated filler, or comments that substitute for implementation.

Broad abstractions should normally have substantial implementation depth. Small modules remain acceptable when their useful domain is genuinely small.

## Required package evidence

A package seeking `stable` status publishes:

- package name, version, edition and quality level;
- compatible Noqeri compiler range;
- entry module and license;
- supported targets/platform conditions;
- public API overview;
- tests and exact local test command;
- runnable example(s);
- negative/failure behavior;
- migration/deprecation notes where relevant;
- benchmark method for performance-sensitive packages;
- security notes for parsers, crypto, networking, serialization, database and concurrency packages.

## Safety-sensitive packages

Packages exposing raw memory, FFI, volatile IO, inline assembly or unchecked operations must identify their unsafe surface. Safe callers should not need pointer invariants for normal use; wrappers validate inputs and confine unsafe operations to the smallest implementation boundary.

Parser/network/database packages should be enrolled in fuzz targets before stable promotion. Concurrency packages require race-mode coverage. Arithmetic packages whose behavior depends on overflow require checked-overflow coverage.

## Performance claims

The registry rejects unqualified claims such as “2x faster”, “zero overhead”, or “faster than Rust/Zig”. Evidence must include source revision, target/backend, compiler versions/flags, hardware/OS, safety/overflow mode, input size, warm-up/sample counts, raw samples, median, and a tail statistic.

A result is evidence for the measured configuration, not a universal property of a package.

## Promotion checklist

Before promotion to stable/core, reviewers should answer yes to the relevant questions:

1. Is there one obvious normal path for a new user?
2. Does the package contain real implementation rather than an API-shaped stub?
3. Are invalid inputs handled deliberately?
4. Are common mistakes and negative paths tested?
5. Is the API consistent with neighboring packages?
6. Does it avoid unnecessary platform coupling?
7. Are unsafe operations isolated/documented?
8. Is performance measured when it is a stated property?
9. Does the compatibility dashboard pass for every claimed compiler version?
10. Are README examples executable rather than pseudocode presented as working code?
11. Are known security advisories reflected in the advisory feed?
12. Can a user vendor the package for an offline build?

## Compatibility dashboard

`tools/compatibility-dashboard.mjs` scans all package versions and emits a machine-readable matrix against `compatibility/releases.json`. A row only becomes `pass` after the package's test command has actually been executed with that compiler version; discovery alone is reported as `untested`.

## Ecosystem priority

Foundational packages—binary encoding, bitsets, bloom filters, caches, deques/heaps/priority queues, parser/lexer support, encoding, calendar/time, channels/events/futures/pools and metrics—should be promoted module-by-module after tests demonstrate depth. Creating hundreds of shallow package directories is not progress.
