# noqeri/fs 0.1.1 API Reference

## 10 exported functions

- fsDeleteIfExists
- fsExtensionStart
- fsFileNameStart
- fsJoinRelative
- fsJoinSize
- fsPathHasNul
- fsReadIfPresent
- fsRelativeSafe
- fsSeparator
- fsWriteNonEmpty

## 4 external host bindings

- fsExists
- fsReadText
- fsRemove
- fsWriteText

## Scope

Validated relative paths, safe component splitting, portable separators and guarded host file operations, all with caller-owned buffers.

## Limitations

Path checks cannot prevent symlink traversal or TOCTOU races once host filesystem calls occur. Host MUST use dirfd/openat-style sandboxing and reject symlinks when enforcing a security boundary. This package is a path utility, not an OS sandbox.
