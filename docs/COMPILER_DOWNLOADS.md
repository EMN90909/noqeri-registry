# Compiler downloads

This repository retains the static compiler download page at
[`downloads/index.html`](../downloads/index.html) and an optional immutable
release listing at `downloads/releases.json`. These are served by Go.

The previous Python release synchronizer and Python installer were removed in
the breaking migration to Go + Noqeri. **Automatic release synchronization,
online binary checksum verification and CLI installation are not currently
implemented in the new Go toolchain.** A blank release listing means no
verified compiler release is advertised here.

For published artifacts, consult the official
[Noqeri compiler GitHub Releases](https://github.com/EMN90909/Noqeri/releases)
and independently verify its release checksums. Do not infer an artifact is
verified simply because an old download-page link exists.

See [Go + Noqeri architecture](GO_NOQERI.md) for current capabilities.
