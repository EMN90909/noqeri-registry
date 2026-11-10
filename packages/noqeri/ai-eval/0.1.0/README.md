# noqeri/ai-eval v0.1.0 — experimental

Regression metrics, binary classification confusion/precision/recall/F1 and deterministic top-k ranking.

```sh
noqeri pkg add noqeri/ai-eval@0.1.0
noqeri run packages/noqeri/ai-eval/0.1.0/tests/regression.noqeri
```

**Limitations:** This is an offline, single-process scalar evaluator, not an online dashboard or distributed model-monitoring service.

All tests are source-level fixtures; native compilation and cross-platform results are not yet verified.
