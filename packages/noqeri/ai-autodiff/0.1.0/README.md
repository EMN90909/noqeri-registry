# noqeri/ai-autodiff v0.1.0 — experimental

Functional reverse-mode autodiff scalar tape with add, multiply, ReLU and full backpropagation.

```sh
noqeri pkg add noqeri/ai-autodiff@0.1.0
noqeri run packages/noqeri/ai-autodiff/0.1.0/tests/regression.noqeri
```

**Limitations:** The tape handles scalar nodes only, uses caller-owned buffers, and has no native GPU or tensor graph lowering.

All tests are source-level fixtures; native compilation and cross-platform results are not yet verified.
