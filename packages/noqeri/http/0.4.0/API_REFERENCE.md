# http 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/http.noqeri
- Exported functions: 10
- Host externs: 0

## Exported API

- httpHeaderNameByteValid
- httpHeaderNameValid
- httpHeaderValueValid
- httpIsClientError
- httpIsRedirect
- httpIsServerError
- httpIsSuccess
- httpMethodIsSafe
- httpResponseBodyAllowed
- httpStatusClass

## Expanded functionality

HTTP response status and header validation to prevent CRLF header injection.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
