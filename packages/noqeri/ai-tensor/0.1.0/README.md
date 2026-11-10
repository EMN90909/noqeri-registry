# noqeri/ai-tensor v0.1.0 — experimental

Portable bounded CPU tensor/vector operations: row-major matmul, transpose, elementwise operations, dot and MSE.

Import `src/tensor.noqeri` or install through the Noqeri registry. Caller supplies all arrays; code does not allocate, use Node.js or require network.

```sh
noqeri pkg add noqeri/ai-tensor@0.1.0
noqeri run packages/noqeri/ai-tensor/0.1.0/tests/regression.noqeri
```

**Limitations:** CPU-only scalar kernels, no SIMD/GPU, no floating-point NaN/Inf guarantees, no automatic differentiation between modules and no tested native performance claims. Buffer aliasing is not supported for multi-dimensional operations. Tests are source fixtures only until executed on native compiler.
