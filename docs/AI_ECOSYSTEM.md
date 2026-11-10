# Native Noqeri AI ecosystem — November 2026

The Noqeri registry includes **9 new experimental AI building-block packages** and an optional umbrella dependency bundle `noqeri/ai-framework@0.1.6`.

## Packages

| Noqeri library | Functional implementation in v0.1.0 | Out of scope |
| --- | --- | --- |
| `noqeri/ai-tensor` | row-major vector and matrix CPU math | GPU/SIMD tensor backend |
| `noqeri/ai-nn` | dense-layer training and ReLU gradients | Automatic multi-layer wiring |
| `noqeri/ai-optim` | SGD/momentum and gradient updates | Mixed precision or distributed optimizer |
| `noqeri/ai-autodiff` | scalar reverse-mode gradient tape | Heap-based tensors and dynamic graph compiler |
| `noqeri/ai-tokenizer` | UTF-8 validation and byte tokenization | Pretrained BPE/SentencePiece vocabularies |
| `noqeri/ai-eval` | model accuracy, F1 and error metrics | Distributed evaluation jobs |
| `noqeri/ai-agent` | bounded capability-policy state machine | Host tool execution and LLM authorization |
| `noqeri/ai-vector` | exact embedding ranking and vector similarity | ANN indexes and external vector databases |
| `noqeri/ai-data` | bounded datasets, batching and statistics | Streaming data loaders or filesystem I/O |

## Installation

```sh
# Bring in all nine pinned packages through the umbrella:
noqeri pkg add noqeri/ai-framework@0.1.6
noqeri pkg install

# Or install a single library:
noqeri pkg add noqeri/ai-tensor@0.1.0
```

Each package contains `package.noqeri`, `src/*.noqeri`, `tests/regression.noqeri`, a README, a license and release notes. Existing `ai-framework@0.1.5` remains immutable.

## Testing with a locally installed Noqeri SDK

```sh
# No GitHub Actions or Node.js required.
python3 tools/verify_package_depth.py
noqeri run packages/noqeri/ai-tensor/0.1.0/tests/regression.noqeri
noqeri run packages/noqeri/ai-nn/0.1.0/tests/regression.noqeri
noqeri run packages/noqeri/ai-autodiff/0.1.0/tests/regression.noqeri
noqeri run packages/noqeri/ai-agent/0.1.0/tests/regression.noqeri
```

Run every remaining `ai-*/0.1.0/tests/regression.noqeri` against the same SDK toolchain and record explicit pass/fail status before promotion.

## Design constraints

- All kernels are handwritten native Noqeri source. Caller-owned slices make buffer lifetimes explicit. No Node.js runtime or external HTTP service is necessary for these algorithms.
- The `ai-tensor` matrix kernels and `ai-vector` search are scalar, CPU-only reference implementations. Performance relative to C/PyTorch has not been measured.
- `ai-autodiff` is a reverse-mode scalar tape, not a full tensor autograd engine. `ai-nn` has explicit dense-layer forward/backward operations.
- `ai-tokenizer` validates UTF-8 but uses byte IDs; pair-merge routines do not train a complete BPE vocabulary.
- `ai-agent` accounts for budgets and approval decisions in-process; security boundaries must be implemented and enforced by the trusted host. It must not be used alone to authorize tool calls or financial transactions.
- `ai-eval` uses CPU float arrays and deterministic tie handling. Validate nonfinite numbers and data quality before deployment.
- The existing separately linked native `libnoqeri_ai` is not automatically imported or initialized by the new packages. Full framework/compiler self-hosting and LLM training remain separate work.

**Quality state:** all nine new packages and the umbrella release are marked `experimental`, `test-contract`. Source-level fixture checks do not imply successful runtime execution, hardware support, or security certification.
