# fs 0.1.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/fs.noqeri
- Exported functions: 3
- Host externs: 4

## Exported API

- fsPathByteUnsafe
- fsPathHasTraversal
- fsSafeRelativePath

## External host bindings required

- fsExists
- fsReadText
- fsRemove
- fsWriteText

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Relative file path component validation for sandboxed paths.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
