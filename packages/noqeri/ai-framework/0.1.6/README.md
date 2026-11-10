# Noqeri AI Framework 0.1.6 — native AI ecosystem (experimental)

This version retains the portable scalar regression and training helpers from 0.1.5, and adds **nine pinned standalone Noqeri packages** as a convenience bundle. These are dependency-based modules, not reimplemented inside the umbrella.

- **`noqeri/ai-tensor@0.1.0`** — row-major vector and matrix CPU math
- **`noqeri/ai-nn@0.1.0`** — dense-layer training and ReLU gradients
- **`noqeri/ai-optim@0.1.0`** — SGD/momentum and gradient updates
- **`noqeri/ai-autodiff@0.1.0`** — scalar reverse-mode gradient tape
- **`noqeri/ai-tokenizer@0.1.0`** — UTF-8 validation and byte tokenization
- **`noqeri/ai-eval@0.1.0`** — model accuracy, F1 and error metrics
- **`noqeri/ai-agent@0.1.0`** — bounded capability-policy state machine
- **`noqeri/ai-vector@0.1.0`** — exact embedding ranking and vector similarity
- **`noqeri/ai-data@0.1.0`** — bounded datasets, batching and statistics

```sh
noqeri pkg add noqeri/ai-framework@0.1.6
noqeri pkg install
```

**Limits:** the framework does not provide integrated GPU execution, LLM weights, a tokenizer vocabulary/training pipeline, host tool sandbox, or automatic compiler bindings to native `libnoqeri_ai`. These modules use caller-managed buffers and are deliberately experimental pending compiler/runtime tests. Existing earlier versions remain unchanged.

See [ecosystem overview](../../../docs/AI_ECOSYSTEM.md) in the registry repository.
