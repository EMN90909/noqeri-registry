# Noqeri package depth audit — 2026-11-10

This is an audit and implementation ledger, **not** a claim that all packages are production-ready. The current catalog has 57 package names. Existing historical release directories are immutable and may expose APIs with different levels of depth.

## This implementation pass

`0.5.0` experimental releases add functional logic and negative regression fixtures to 13 packages: `noqeri/json`, `noqeri/http`, `noqeri/retry`, `noqeri/jwt`, `noqeri/rate-limit`, `noqeri/csv`, `noqeri/core`, `noqeri/std`, `noqeri/router`, `noqeri/html`, `noqeri/fs`, `noqeri/url`, `noqeri/uuid`.

Tests were added as fixtures but **were not executed** on each native SDK target. The quality index remains `experimental`, `test-contract`; production/stable claims require measured evidence.

## All-package status and next acceptance gate

| Package | Current highest version | This pass | Required next depth gate |
| --- | --- | --- | --- |
| `noqeri/core` | `0.5.0` | Expanded 0.5.0; runtime unverified | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/std` | `0.5.0` | Expanded 0.5.0; runtime unverified | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/security` | `0.4.0` | Not yet deepened; experimental | Cryptographic provider verification, trust policy, rejection of malformed/adversarial inputs and security tests. |
| `noqeri/test` | `0.4.0` | Not yet deepened; experimental | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/base64` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/csv` | `0.5.0` | Expanded 0.5.0; runtime unverified | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/hex` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/json` | `0.5.0` | Expanded 0.5.0; runtime unverified | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/toml` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/xml` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/yaml` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/regex-lite` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/semver` | `0.4.0` | Not yet deepened; experimental | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/glob` | `0.4.0` | Not yet deepened; experimental | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/uuid` | `0.5.0` | Expanded 0.5.0; runtime unverified | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/jwt` | `0.5.0` | Expanded 0.5.0; runtime unverified | Cryptographic provider verification, trust policy, rejection of malformed/adversarial inputs and security tests. |
| `noqeri/http` | `0.5.0` | Expanded 0.5.0; runtime unverified | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/http-server` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/http-client` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/url` | `0.5.0` | Expanded 0.5.0; runtime unverified | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/html` | `0.5.0` | Expanded 0.5.0; runtime unverified | Complete grammar/codec algorithms, malformed-input rejection, size/depth bounds, round-trip and interoperability fixtures. |
| `noqeri/web` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/dom` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/fetch` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/router` | `0.5.0` | Expanded 0.5.0; runtime unverified | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/fs` | `0.5.0` | Expanded 0.5.0; runtime unverified | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/env` | `0.4.0` | Not yet deepened; experimental | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/crypto` | `0.4.0` | Not yet deepened; experimental | Cryptographic provider verification, trust policy, rejection of malformed/adversarial inputs and security tests. |
| `noqeri/postgres` | `0.4.0` | Not yet deepened; experimental | Actual database driver/transaction or distributed transport integration tests; connection lifecycle and failure recovery. |
| `noqeri/sqlite` | `0.4.0` | Not yet deepened; experimental | Actual database driver/transaction or distributed transport integration tests; connection lifecycle and failure recovery. |
| `noqeri/db` | `0.4.0` | Not yet deepened; experimental | Actual database driver/transaction or distributed transport integration tests; connection lifecycle and failure recovery. |
| `noqeri/time` | `0.4.0` | Not yet deepened; experimental | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/net` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/tls` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/websocket` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/supabase` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/firebase` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/convex` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/clerk` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/stripe` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/resend` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/cloudflare` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/vercel` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/neon` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/upstash` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/sentry` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/openai` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/auth0` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/planetscale` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/turso` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/github` | `0.4.0` | Not yet deepened; experimental | Host-backed authenticated operations with sandbox fixtures, pagination, error typing, retries/timeouts, redaction and vendor contract checks. |
| `noqeri/tailwind` | `0.4.0` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |
| `noqeri/retry` | `0.5.0` | Expanded 0.5.0; runtime unverified | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/rate-limit` | `0.5.0` | Expanded 0.5.0; runtime unverified | Executable data/collection and error-handling tests; boundary and ownership semantics; deterministic behavior on every target. |
| `noqeri/pgas` | `0.1.4` | Not yet deepened; experimental | Actual database driver/transaction or distributed transport integration tests; connection lifecycle and failure recovery. |
| `noqeri/ai-framework` | `0.1.4` | Not yet deepened; experimental | Tensor shape/gradient correctness, CPU backend interoperability, reproducibility, numerical stability, benchmarks and training tests. |
| `noqeri/components` | `0.2.1` | Not yet deepened; experimental | Real transport, routing, request parsing, TLS/cookie/session policy, cancellation, concurrency and browser/native end-to-end tests. |

## Release quality rules

1. Do not label a package **stable** or **core** merely because it exports many functions or has checked-in tests.
2. Do not mutate published release trees, silently change MIT/GPL licensing or reuse a version number for different bytes.
3. A new registry entry needs a valid `package.noqeri`, matching entry source, license, positive and negative behavior tests, example, documented host bindings, and dependency parity.
4. Authenticated providers must reject arbitrary credential-bearing destinations; transport/authentication errors must not masquerade as successful empty responses.
5. A native package should declare its required platform/host capabilities. Node.js is not a runtime prerequisite.
6. Validate releases with local compiler/native runtime tests and reproducible archive/hash verification before promotion; no unrun fixture is evidence of verified compatibility.

## Priority after the 13 expanded releases

**Next:** serialization and codecs (`base64`, `hex`, `toml`, `xml`, `yaml`, `semver`), crypto verification (`jwt`, `security`, `crypto`), network stack (`http-client`, `http-server`, `net`, `tls`, `websocket`) and actual database/provider adapters. The remaining catalog entries require package-specific implementations, not mass version bumps.
