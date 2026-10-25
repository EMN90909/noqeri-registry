# noqeri/fetch 0.1.1 API Reference

## 14 exported functions

- fetchCancelIfActive
- fetchDone
- fetchHandleValid
- fetchHttpStatusValid
- fetchMaxResponseValid
- fetchRetryDelay
- fetchStartChecked
- fetchStatusDone
- fetchStatusOk
- fetchStatusRedirect
- fetchStatusRetryable
- fetchSuccessful
- fetchTextIfSuccess
- fetchUrlHttps

## 4 external host bindings

- fetchCancel
- fetchStart
- fetchStatus
- fetchText

## Scope

Asynchronous fetch-host lifecycle helpers, request URL validation, HTTP response classification, retry backoff and cancellation guards.

## Limitations

The runtime must supply fetchStart, fetchStatus, fetchText, fetchCancel. This package cannot enforce DNS SSRF protection, redirect policies, TLS certificate validation or timeouts by itself. Applications should use explicit host allowlists and bounded responses.
