# Noqeri package quality levels

Every official package must have one public maturity level. Package existence is not evidence of stability.

## `experimental`

For exploration, provider contracts, incomplete implementations and APIs that may change incompatibly. An extern/provider stub without an executable supported host is **experimental**. It must never be described as stable merely because its manifest says `1.0.0`.

Requirements:

- valid manifest and license;
- package source is substantive enough to test the intended API shape;
- unsafe/native boundaries identified;
- known missing runtime/provider capabilities documented.

No compatibility/support promise beyond published advisory information.

## `preview`

Usable for evaluation and non-critical projects. API direction is intentional but may still change before stable.

Requirements in addition to experimental:

- executable implementation on at least one declared supported host;
- automated functional tests;
- documented error/timeouts/resource behavior;
- package integrity and advisory scanning;
- examples that run on the supported host.

## `stable`

Suitable for normal production use on the package's documented platform matrix.

Requirements in addition to preview:

- compatibility tests against every supported stable Noqeri release;
- no provider-stub-only code paths for advertised core behavior;
- semantic versioning and deprecation policy;
- security response/support window;
- deterministic lock/install behavior;
- API documentation and realistic integration tests;
- performance/resource limits documented for network/storage packages.

Breaking changes require a major release or a documented ecosystem migration process.

## `core`

A stable package maintained as part of the Noqeri language/runtime experience. Core is deliberately small.

Requirements in addition to stable:

- included in language release gating;
- conformance or practical-corpus coverage;
- supported on the relevant official Noqeri platform matrix;
- security fixes coordinated with compiler/runtime releases;
- ordinary applications may rely on it without learning unsafe/ABI details.

## Promotion rule

Promotion is evidence-driven. A package moves upward only after satisfying the next level's gates. A package can move downward when a critical implementation/provider gap is discovered; this is metadata honesty, not a semantic-version rewrite.

The compatibility dashboard consumes these levels. Failed compatibility/security tests block `stable`/`core` publication but may be shown as expected limitations for `experimental` packages.
