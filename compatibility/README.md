# Compatibility evidence

Noqeri package compatibility is an executed claim, not an inventory claim.

`releases.json` defines the compiler releases the registry currently expects packages to support. `tools/compatibility-runner.mjs` executes each package version against those compilers and writes a machine-readable evidence bundle. `tools/compatibility-dashboard.mjs` then merges that evidence into the package/compiler matrix.

## Run locally

Provide one compiler binary for every release you want to verify:

```sh
NOQERI_COMPILER_1_0_0=/opt/noqeri-1.0.0/bin/noqeri \
  node tools/compatibility-runner.mjs . build/compatibility-results.json --require-all

node tools/compatibility-dashboard.mjs \
  . \
  build/compatibility-dashboard.json \
  build/compatibility-results.json
```

You can also pass compiler binaries explicitly:

```sh
node tools/compatibility-runner.mjs \
  . \
  build/compatibility-results.json \
  --compiler=1.0.0:/opt/noqeri-1.0.0/bin/noqeri \
  --require-all
```

## Evidence states

A package with tests but no execution result is `test-contract`, not `verified`.

- `untested`: no execution bundle was supplied to the dashboard.
- `unavailable`: the requested compiler release was not configured or could not execute.
- `failed`: the compiler was present but the package check/test failed, its entry was invalid, or the binary did not identify as the requested compiler version.
- `pass`: the package test command (or entry check when no package tests exist) exited successfully with the stated compiler release.

Only `pass` rows are emitted with `evidence_state: "verified"`.

## Release gate

For a `stable` or `core` package promotion, run the compatibility runner with `--require-all`. Missing compiler binaries then fail the gate instead of silently reducing coverage. Preserve the resulting JSON with the release evidence so a future dashboard can show which compiler, package version, command and duration produced each result.

The runner intentionally does not invent historical results and the registry should never commit a fabricated all-green matrix. If a compiler cannot be tested, publish `unavailable` or leave the pair `untested` until real execution evidence exists.
