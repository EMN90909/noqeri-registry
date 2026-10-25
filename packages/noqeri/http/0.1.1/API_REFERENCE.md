# noqeri/http 0.1.1 API Reference

## 17 exported functions

- httpAllowedMethod
- httpBodyAllowed
- httpClientError
- httpEncodeQuery
- httpEncodedSize
- httpHeaderNameValid
- httpHeaderToken
- httpHeaderValueValid
- httpHexDigit
- httpRedirect
- httpRequestSizeValid
- httpRetryable
- httpSafeMethod
- httpServerError
- httpStatusValid
- httpSuccess
- httpUnreserved

## 0 external host bindings


## Scope

RFC-style HTTP status categories, header validation, safe methods, bounded request metadata, and strictly validated percent encoding for query bytes.

## Limitations

Pure HTTP protocol helpers only. Transport, TLS, parsing full HTTP messages and cookie/session management require a host. Raw URLs require independent DNS, redirect and authority validation.
