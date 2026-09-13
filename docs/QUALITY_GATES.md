# Noqeri Registry Quality Gates

The registry rewards packages that are useful, testable, teachable, compatible and supportable rather than packages that merely occupy a namespace.

## Official package quality levels

Every published package version has one explicit level. A provider stub must never be labelled `stable` or `core`.

### experimental

For exploration. APIs may change without migration guarantees. Minimum: valid manifest, real source (not filler), license, bounded package size, and a clear statement of what works and what does not.

### preview

For real evaluation. Requires meaningful implementation, input validation, automated tests, at least one runnable example, documented error behaviour, and an explicit supported target/compiler range. Breaking changes are allowed but require release notes.

The minimum test evidence is `test-contract`: executable tests exist, but they do not need to be represented as having passed on every release target yet.

### stable

For normal production use. Requires preview evidence plus negative/failure tests, compatibility-matrix passes for every claimed supported Noqeri release, versioned API notes, deprecation policy, security notes for sensitive packages, and reproducible performance methodology when performance is part of the package's purpose. A stable package cannot be a provider-shaped stub.

The minimum test evidence is `verified`: the relevant tests have actually passed for the stated release configuration. If the package makes a performance claim, that claim additionally requires `measured` performance evidence.

### core

For ecosystem-critical packages whose compatibility/support burden is intentionally higher. Requires stable evidence plus multiple release cycles of compatibility, maintained security response, migration coverage for deprecations, deterministic/offline install evidence, and explicit maintainership. `core` is a support promise, not a popularity badge.

## Evidence states

Quality level and evidence state answer different questions. Quality level is a support promise; evidence state says what has been proved for a particular configuration.

- `planned` — accepted direction, no implementation claim;
- `implemented` — source implementation exists and is reviewable;
- `test-contract` — executable positive/negative tests exist but no passing result bundle is attached for the current release environment;
- `verified` — relevant tests passed for a stated commit/compiler/backend/target/mode;
- `measured` — benchmark samples and environment metadata are published;
- `regression-gated` — a comparable baseline and threshold are automatically enforced.

A checked-in test file is never enough to label a package `verified` by itself.

## Depth rule

Source size is a signal, not a quality target. A package is rejected from stable/core status if it is made artificially large through aliases, duplicate wrappers, repeated constants, generated filler, or comments that substitute for implementation.

Broad abstractions should normally have substantial implementation depth. Small modules remain acceptable when their useful domain is genuinely small.

### Deep-module evidence contract

For foundational modules, reviewers should evaluate capability depth rather than a byte target. A module is considered meaningfully deep only when the implementation demonstrates all applicable evidence below:

- a real data model or algorithm rather than four generic convenience helpers;
- explicit invariants for capacity, indexing, state transitions or protocol state;
- a normal-path API that can be explained with a small example;
- deliberate behavior for empty, full, invalid, null, malformed or out-of-range inputs;
- positive behavioral tests and negative/failure tests;
- tests that import the public module instead of copying the implementation into fixtures;
- at least one realistic multi-operation scenario, not only single-function assertions;
- safety notes when raw pointers, borrowing, overflow, concurrency, parsing or external input are involved;
- benchmark methodology and representative workloads when latency, throughput or memory efficiency are part of the value proposition;
- no generated repetition, alias farms, duplicated constants or comments used to manufacture line/byte counts.

A broad module may naturally exceed 30 KB as features, tests and documentation mature, but `30 KB` is never accepted as proof by itself. Conversely, a compact algorithm can qualify when its domain is intrinsically small and its tests show complete behavior.

### Foundational-structure baseline

Containers and low-level structures such as bitsets, Bloom filters, deques, heaps, priority queues, queues, maps, sets, pools and rings should normally demonstrate:

1. initialization and invariant validation;
2. length/capacity/empty/full state where relevant;
3. primary mutation and lookup operations;
4. boundary behavior for zero capacity and full capacity;
5. invalid-index/null handling at safe API boundaries;
6. deterministic ordering semantics where ordering matters;
7. bulk/copy or iteration support when useful;
8. behavior tests covering sequences of operations;
9. a documented allocation/ownership model;
10. a performance fixture for operations advertised as performance-sensitive.

A module that only exposes `len`, `is_empty`, `first` and `last` does not satisfy this baseline, regardless of package metadata or documentation volume.

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
- security notes for parsers, crypto, networking, serialization, database and concurrency packages;
- test evidence state for the exact release configuration;
- performance evidence state when performance is advertised.

## Safety-sensitive packages

Packages exposing raw memory, FFI, volatile IO, inline assembly or unchecked operations must identify their unsafe surface. Safe callers should not need pointer invariants for normal use; wrappers validate inputs and confine unsafe operations to the smallest implementation boundary.

Parser/network/database packages should be enrolled in fuzz targets before stable promotion. Concurrency packages require race-mode coverage. Arithmetic packages whose behavior depends on overflow require checked-overflow coverage.

### Language-safety evidence

Packages that rely on Noqeri's safety guarantees should state which guarantees their tests exercise. For the 2026 language line this can include:

- runtime bounds checks for dynamic safe indexing;
- runtime null checks before raw-pointer use;
- explicit `unsafe {}` boundaries around operations that bypass ordinary guarantees;
- aggregate/field-sensitive and interprocedural borrow analysis;
- checked-overflow execution when arithmetic overflow is security- or correctness-relevant.

A package must not claim that one of these protections is active merely because the compiler supports it; the package or ecosystem test suite must exercise the relevant path for the claimed configuration.

## Performance claims

The registry rejects unqualified claims such as “2x faster”, “zero overhead”, or “faster than Rust/Zig”. Evidence must include source revision, target/backend, compiler versions/flags, hardware/OS, safety/overflow mode, input size, warm-up/sample counts, raw samples, median, and a tail statistic.

A result is evidence for the measured configuration, not a universal property of a package.

### Performance evidence levels

Performance-sensitive packages should publish one of these evidence states so the website never turns an unmeasured expectation into a marketing claim:

- `unmeasured` / evidence below `measured`: benchmark fixture exists but has not been executed for the release;
- `measured`: reproducible samples include machine/compiler/backend/target metadata and raw data;
- `regression-gated`: a documented threshold is enforced against a pinned comparable baseline.

Changing algorithmic complexity, storage layout, safety mode, backend, compiler version or target invalidates comparisons unless the report calls out that change explicitly.

## Executable policy helpers

`tools/quality_policy.nqr` encodes the promotion contract used by registry-side tooling and tests. It now separates quality levels from evidence states and exposes stricter promotion helpers:

- `registryCanPublishPreviewEvidence(...)` requires real depth plus at least a `test-contract`;
- `registryCanPublishStableEvidence(...)` requires verified test evidence and measured performance whenever a performance claim is made;
- `registryCanPublishCoreEvidence(...)` layers release-cycle/offline/maintainer requirements on top of the stable gate;
- claim helpers prevent safety/performance labels from being emitted without the corresponding evidence state and metadata.

`tests/quality_policy.nqr` is the executable contract for these rules.

## Package-depth audit

`tools/package-depth-audit.mjs` scans every package version under `packages/` and reports source depth independently from manifest claims.

It checks:

- total source bytes and nonblank code lines;
- exported API count, records/private functions and control flow;
- tests and runnable examples;
- README and manifest entry presence;
- GPL-3.0-only package metadata;
- obvious placeholder patterns;
- the requested 30 KiB source target as an informational field only.

Run:

```sh
node tools/package-depth-audit.mjs
node tools/package-depth-audit.mjs --json
node tools/package-depth-audit.mjs --strict
```

`--strict` exits non-zero while obvious placeholder package versions remain. A package becomes `reviewable` in the audit only when it has real source depth, tests, examples, README, a valid entry path and GPL-3.0-only metadata.

The audit is intentionally conservative: passing it is necessary evidence of implementation depth, not an automatic `stable` promotion.

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
13. Do foundational structures satisfy the deep-module evidence contract rather than merely a source-size target?
14. Are safety guarantees exercised by tests in the configuration in which they are advertised?
15. Is the package evidence state high enough for the requested quality level?
16. If performance is advertised, are raw measured samples attached for that exact release configuration?

## Compatibility dashboard

`tools/compatibility-dashboard.mjs` scans all package versions and emits a machine-readable matrix against `compatibility/releases.json`. A row only becomes `pass` after the package's test command has actually been executed with that compiler version; discovery alone is reported as `untested`.

## Ecosystem priority

Foundational packages—binary encoding, bitsets, bloom filters, caches, deques/heaps/priority queues, parser/lexer support, encoding, calendar/time, channels/events/futures/pools and metrics—should be promoted module-by-module after tests demonstrate depth. Creating hundreds of shallow package directories is not progress.

The preferred expansion sequence is:

1. structures and numeric primitives;
2. text/encoding/parsing foundations;
3. time, scheduling and concurrency primitives;
4. IO, networking and protocol layers;
5. higher-level provider integrations.

Each tranche should leave behind executable tests, teaching examples and performance fixtures before the next tranche is promoted.
