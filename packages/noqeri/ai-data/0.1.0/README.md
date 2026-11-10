# noqeri/ai-data v0.1.0 — experimental

Deterministic batch slicing, train splits, gathered data rows, Welford statistics and centering utilities.

No Node.js, hidden GPU dependency, external database, network or dynamic allocation. Inputs are caller-owned slices. **Native compilation and performance remain unverified.**

```sh
noqeri pkg add noqeri/ai-data@0.1.0
noqeri run packages/noqeri/ai-data/0.1.0/tests/regression.noqeri
```

The deterministic library does not implement random shuffling, streaming I/O or distributed dataset loading.
