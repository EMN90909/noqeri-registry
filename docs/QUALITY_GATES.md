# Noqeri Registry Quality Gates

The registry should reward packages that are useful, testable and teachable rather than packages that merely occupy a namespace.

## Package maturity levels

### Prototype

A prototype may explore an API, but it must be labelled as such. It should not be presented as standard-library-equivalent maturity.

### Usable

A usable package has a coherent purpose, documented normal path, meaningful implementation, input validation, focused tests and at least one runnable example.

### Verified

A verified package additionally has negative/failure tests, target compatibility evidence, versioned API notes and performance/security evidence where relevant.

## Depth rule

Source size is a signal, not a quality target. A package is rejected from `verified` status if it is made artificially large through aliases, duplicate wrappers, repeated constants or filler comments.

For packages representing broad abstractions, reviewers should expect substantial implementation depth. Small modules are allowed when their useful domain is genuinely small.

## Required package evidence

A package seeking `verified` status should publish:

- package name and version;
- compatible Noqeri edition/version;
- entry module;
- license;
- supported targets;
- public API overview;
- tests and test command;
- example program(s);
- failure/error behaviour;
- benchmark method for performance-sensitive packages;
- security notes for parsers, crypto, networking, serialization and concurrency packages.

## Safety-sensitive packages

Packages that expose raw memory, FFI, volatile IO, inline assembly or unchecked operations must clearly identify their unsafe surface. The long-term Noqeri rule is that safe callers should not need to understand raw pointer invariants for normal use; wrappers should validate inputs and confine unsafe operations to the smallest possible implementation boundary.

## Performance claims

The registry must not accept unqualified claims such as “2x faster” or “zero overhead”. Evidence should include commit SHA, target, backend, hardware where available, safety/overflow mode, input size, warmup/sample counts, median and tail statistic, and the exact benchmark source.

A benchmark result is evidence for the measured configuration, not a universal property of the package.

## Standard-library promotion checklist

Before a registry package is considered for inclusion in `std`, reviewers should be able to answer yes to these questions:

1. Is there one obvious normal path for a new user?
2. Does the package contain real implementation rather than an API-shaped stub?
3. Are invalid inputs handled deliberately?
4. Are common mistakes covered by tests?
5. Is the API named consistently with neighboring `std` modules?
6. Does it avoid unnecessary platform coupling?
7. Are safety-sensitive operations isolated and documented?
8. Is performance measured when performance is part of the package's purpose?
9. Can another maintainer understand the implementation without private context?
10. Are README examples executable rather than pseudocode presented as working code?

## Current ecosystem priority

The immediate depth queue includes foundational packages such as binary encoding, bitsets, bloom filters, caches, deques/heaps/priority queues, parser/lexer support, encoding, calendar/time helpers, channels/events/futures/pools and metrics. Promotion should happen module-by-module after tests demonstrate depth; creating hundreds of shallow package directories is not progress.
