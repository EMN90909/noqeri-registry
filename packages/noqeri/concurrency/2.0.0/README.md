# noqeri/concurrency 2.0.0

Canonical concurrency helpers for the Noqeri reference runtime.

This release intentionally changes the 1.0 API because 1.0 used an older provider ABI that did not match the executable runtime. Version 2 uses the same host symbols and signatures as Noqeri's canonical standard-library task, channel, mutex and RW-lock modules.

## Included

- named lightweight task spawning with a string payload
- task state, timeout joins and cooperative cancellation
- bounded `i64` channels with timeout send/receive
- mutexes with timeout and try-lock
- reader/writer locks with timeout and try-lock
- deterministic handle destruction
- `cancel_on_timeout` structured-concurrency helper

Ordinary callers do not use `unsafe`; the package contains the audited host boundary internally.

## Runtime status

Quality: **preview** for Noqeri runtimes implementing the canonical `taskHost*`, `channelHost*`, `mutexHost*` and `rwlockHost*` services. The Noqeri C++17 reference runtime implements these services and has scheduler, synchronization and race-check regression tests.

First-class function-value task spawning is deliberately deferred until the self-host compiler supports function values. Until then, `spawn` accepts the name of a Noqeri task entry function and a string payload.

## Safety

Run application tests with `noqeri test --race`, `--check-memory` and `--overflow` where appropriate. Cancellation is cooperative; long-running task functions should poll the current-cancellation state at safe interruption points.

SPDX-License-Identifier: GPL-3.0-only
