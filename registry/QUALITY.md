# Published package quality

`quality.json` is the registry's machine-readable quality declaration. The four supported levels are `experimental`, `preview`, `stable` and `core`.

The current registry uses a conservative `experimental` default. Absence of the legacy `experimental: true` field in `index.json` does **not** mean stable. Promotion is explicit.

Package-specific declarations are added to `quality.json` under the exact key `namespace/name@version`. A declaration may be a level string or an object containing `level` plus core-support metadata such as `stable_release_cycles`, `migration_policy`, `offline_install_verified` and `maintainer`.

Before changing a level, generate the evidence report:

```sh
node tools/package-quality.mjs --output=build/package-quality.json
node tools/package-quality.mjs --strict --compatibility=build/compatibility-results.json
```

The gate computes an evidence-backed maximum. `preview` requires source depth, a valid entry, README, tests and examples. `stable` additionally requires negative tests, security notes, no provider-stub/legacy-experimental marker and verified compatibility for every compiler in `compatibility/releases.json`. `core` additionally requires at least two stable release cycles, migration policy, verified offline installation and an identified maintainer.

A declared level may be lower than the evidence-backed maximum. It may never be higher. Missing compatibility execution therefore blocks `stable`/`core` rather than being interpreted as success.

Provider/capability packages are not banned from ever becoming stable: they must first stop being stubs, remove the experimental designation deliberately, acquire real integration/negative/security evidence, and pass the same compatibility gate as other packages.
