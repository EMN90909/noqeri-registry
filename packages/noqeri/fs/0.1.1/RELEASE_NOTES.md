# 0.1.1 release: noqeri/fs

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Path checks cannot prevent symlink traversal or TOCTOU races once host filesystem calls occur. Host MUST use dirfd/openat-style sandboxing and reject symlinks when enforcing a security boundary. This package is a path utility, not an OS sandbox.
