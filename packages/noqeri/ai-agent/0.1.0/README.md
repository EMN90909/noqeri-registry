# noqeri/ai-agent v0.1.0 — experimental

Caller-owned bounded agent state machine with step/token/tool budgets and explicit authorization gates.

```sh
noqeri pkg add noqeri/ai-agent@0.1.0
noqeri run packages/noqeri/ai-agent/0.1.0/tests/regression.noqeri
```

**Limitations:** This is a deterministic policy/state layer. It never executes tools, grants capabilities, authorizes spending or supplies an LLM backend; the host must enforce restrictions.

All tests are source-level fixtures; native compilation and cross-platform results are not yet verified.
