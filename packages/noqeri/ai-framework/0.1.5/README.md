# Noqeri AI Framework 0.1.5 — experimental

Adds functional pure-Noqeri mini-batch linear regression: mean squared loss, averaged bias/weight gradients, validated aligned float batches and bounded SGD updates. Preserves the earlier scalar regression, BPE pair counting, attention-dot scoring and agent policy utilities.

This is **not a full standalone LLM training framework**. Tensor/autodiff/transformer runtime components still live in the separately linked native SDK and are not automatically provided to package imports. Batch functions only train an affine single-feature model, return 0.0 for invalid input (check `ai_framework_batch_valid`), and do not validate NaNs. Apache-2.0. No Node.js required. Regression source included; compiled runtime parity unverified.
