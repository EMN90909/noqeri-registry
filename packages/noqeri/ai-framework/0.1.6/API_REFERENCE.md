# AI Framework 0.1.6 — API / package map

The `src/framework.noqeri` entry retains 0.1.5 APIs including `ai_framework_predict`, `ai_framework_loss`, `ai_framework_grad_weight`, `ai_framework_grad_bias`, `ai_framework_batch_loss`, `ai_framework_batch_grad_weight` and `ai_framework_batch_sgd_weight`.

The 9 new libraries are **dependencies**; import them directly in source using the compiler's supported module/file import convention. They supply tensor kernels, gradient tapes, dense network backward passes, optimizer updates, tokenization, evaluation, bounded agent state, exact vector retrieval and data preparation. See each package's README and regression source for signatures.

No exported function automatically links a GPU/LLM backend, provides user authorization or performs remote network I/O.
