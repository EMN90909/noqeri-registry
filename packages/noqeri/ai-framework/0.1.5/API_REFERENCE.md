# AI Framework package API

`ai_framework_predict`, `ai_framework_loss`,
`ai_framework_grad_weight`, `ai_framework_grad_bias`,
`ai_framework_sgd_weight`, `ai_framework_sgd_bias`,
`ai_framework_clamp`:
  scalar affine model, squared-error reverse gradients, bounded SGD.

`ai_framework_pair_count`: adjacent pair count in a byte slice. Useful
for inspecting possible byte-pair merges. It is not itself a BPE tokenizer.

`ai_framework_attention_score`: dot product for equally-sized float
slices. Returns zero on unequal lengths; callers must validate dimensional
consistency when zero is ambiguous.

`ai_framework_can_run`, `ai_framework_can_call`: local policy checks
for bounded steps and explicit authorization. These do not execute tools.

The native Noqeri framework SDK additionally implements backward tensor
autodiff, causal self-attention training, subword tokenization and
scalar/tiled/SSE2 CPU backends. Native header and library are installed
by the main compiler distribution, not executable through a magic import.

See [main framework guide](https://github.com/EMN90909/Noqeri/blob/main/Doc/AI_FRAMEWORK.md).
