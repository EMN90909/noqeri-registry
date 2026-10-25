# noqeri/fs 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Validated relative paths, safe component splitting, portable separators and guarded host file operations, all with caller-owned buffers.

The new implementation exports 10 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Path checks cannot prevent symlink traversal or TOCTOU races once host filesystem calls occur. Host MUST use dirfd/openat-style sandboxing and reject symlinks when enforcing a security boundary. This package is a path utility, not an OS sandbox.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
