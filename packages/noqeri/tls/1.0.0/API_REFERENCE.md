# tls 1.0.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/tls.noqeri
- Exported functions: 4
- Host externs: 2

## Exported API

- tlsContentTypeValid
- tlsHandleValid
- tlsLegacyVersionValid
- tlsRecordHeaderValid

## External host bindings required

- tlsClose
- tlsConnect

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

TLS record-header framing validation, not certificate or cryptographic verification.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
