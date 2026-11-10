# noqeri/ai-tokenizer v0.1.0 — experimental

Strict UTF-8 validation, reversible 256-token byte vocabulary, ASCII word spans and deterministic pair merges.

```sh
noqeri pkg add noqeri/ai-tokenizer@0.1.0
noqeri run packages/noqeri/ai-tokenizer/0.1.0/tests/regression.noqeri
```

**Limitations:** Byte-level encoding is not full BPE/WordPiece; only one supplied pair-merge rule is applied per call. UTF-8 is checked separately.

All tests are source-level fixtures; native compilation and cross-platform results are not yet verified.
