# noqeri/ai-vector v0.1.0 — experimental

CPU brute-force embedding retrieval with row-major dot products, L2 distance and deterministic streaming top-k.

No Node.js, hidden GPU dependency, external database, network or dynamic allocation. Inputs are caller-owned slices. **Native compilation and performance remain unverified.**

```sh
noqeri pkg add noqeri/ai-vector@0.1.0
noqeri run packages/noqeri/ai-vector/0.1.0/tests/regression.noqeri
```

The exact search uses dot-product ranking, not cosine similarity or approximate nearest neighbors. Large indexes need an optimized native backend.
