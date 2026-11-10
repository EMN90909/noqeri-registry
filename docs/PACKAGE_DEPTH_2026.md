# Noqeri registry package depth — 0.5.0 baseline

## Coverage and evidence

The catalog contains **57 packages**. This change publishes **54 new 0.5.0 package versions** with preserved 0.4.0 public APIs, expanded native Noqeri functionality, README documentation and source-level regression fixtures. The three special-track packages also receive new versions: `noqeri/pgas@0.1.5` (balanced block/cyclic capacity calculations), `noqeri/ai-framework@0.1.5` (bounded scalar mini-batch regression gradients), and `noqeri/components@0.2.2` (accessible skip navigation, live status and screen-reader text). These retain their independent release numbering and are **not** represented as 0.5.0. All **57 packages** therefore have a new version in this update.

The expanded versions cover: parsing/serialization fundamentals (JSON, XML, YAML/TOML subsets, CSV, Base64, URL, hex, regex-lite), security and encoding, HTTP/WebSocket policy, core and standard utility functions, OS/network/database capability contracts, SDK tooling and provider integrations.

## Depth is not runtime parity

**These are developer-preview releases.** The static audit establishes presence and shape of source and tests, not successful Noqeri compiler execution. The Noqeri compiler is not available in this execution environment and GitHub Actions were not used to run tests. New versions must be checked and exercised against supported compiler builds before declaring them stable.

In particular:
- `noqeri/json` now has bounded grammar-level JSON document validation, but no heap-allocated AST or serializer.
- `noqeri/regex-lite` has a bounded scratch-buffer, polynomial-time full-match subset; not PCRE or a complete Unicode engine.
- `noqeri/xml`, `noqeri/yaml`, and `noqeri/toml` expose practical limited parsing/escaping utilities, not full standards-compliant document parsers.
- Service adapters (`supabase`, `stripe`, `openai`, `vercel`, `firebase`, etc.) expose expanded Noqeri request operations, but still depend on authenticated, trusted native host `providerHttpJson` and `providerHttpStatus` bindings. A declaration is not a working transport.
- `postgres`, `sqlite`, `db`, `net`, `tls`, `http-server` and browser APIs still need host implementations, platform-specific verification, integration tests and failure injection.
- `core`, `std` and `security` retain their older module files. `security` has a consolidated new default entry at `src/security.noqeri`; users importing the old entry directly can still access `src/memory.noqeri`.
- Existing older package versions remain immutable; `0.5.0` is an opt-in upgrade for pinned manifests and the default latest version for new unpinned installs. Existing lockfiles remain pinned.
- The 0.5.0 manifest files retain GPL-3.0-only provenance for the legacy code. Additional MIT-licensed functions carry `LICENSE-MIT` notices where imported from independently authored earlier versions.

## Verify locally without Node or GitHub Actions

```sh
python3 tools/verify_package_depth.py
# after installing an appropriate Noqeri compiler, for each package:
noqeri check packages/noqeri/json/0.5.0/src/json.noqeri
noqeri run packages/noqeri/json/0.5.0/tests/regression.noqeri
```

Do not interpret static checks as compiler or runtime success. Native HTTPS/provider tests require a trusted host and scoped test credentials, and must not be run by an untrusted package.
