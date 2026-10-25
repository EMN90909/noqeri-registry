# net 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/net.noqeri
- Exported functions: 5
- Host externs: 2

## Exported API

- ipv4OctetValid
- ipv4TextValid
- ipv4Valid
- netPortValid
- netSocketValid

## External host bindings required

- netClose
- netConnect

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Strict dotted-decimal IPv4 string validation without ambiguity from leading zeros.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
