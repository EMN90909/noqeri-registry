# noqeri/env 0.1.1 API Reference

## 10 exported functions

- envAssignmentSeparator
- envAssignmentValid
- envGetOr
- envInitialNameChar
- envNameCopy
- envNameValid
- envOtherNameChar
- envValueCopy
- envValueStart
- envValueValid

## 2 external host bindings

- envGet
- envHas

## Scope

Portable environment name and assignment parser with bounds-aware key/value offset computation, CRLF injection checks, and host value retrieval contracts.

## Limitations

Environment access is host-dependent. No dotenv escape interpolation or filesystem loading is implemented. Raw secrets must not be printed or committed.
