# Registry compatibility matrix

Compatibility is tested per package version against each compiler version it claims to support. The dashboard must distinguish four states:

- `pass`: the package test command ran successfully with that compiler;
- `fail`: the command ran and failed;
- `untested`: package/release pair was discovered but no execution evidence exists;
- `unsupported`: package metadata does not claim support for that compiler/edition/target.

Never convert `untested` into `pass` merely because a manifest parses. This repository may be tested locally or on self-managed machines; GitHub Actions is not a requirement.

The generator in `tools/compatibility-dashboard.mjs` creates the inventory. Test runners should merge execution evidence into its output and retain compiler hashes/logs for release evidence.
