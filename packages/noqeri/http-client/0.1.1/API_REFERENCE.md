# noqeri/http-client 0.1.1 API Reference

## 20 exported functions

- httpClientBodyLengthValid
- httpClientContentLengthValid
- httpClientCredentialPresent
- httpClientDelete
- httpClientGet
- httpClientHeaderNameValid
- httpClientHeaderToken
- httpClientHeaderValueValid
- httpClientHttpsUrl
- httpClientJson
- httpClientLastStatus
- httpClientMethodAllowed
- httpClientMethodIdempotent
- httpClientPatch
- httpClientPost
- httpClientRetryDelay
- httpClientStatusOk
- httpClientStatusRedirect
- httpClientStatusRetry
- httpClientStatusUnauthorized

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

HTTP client request policy, HTTPS URL inspection, header token validation, response/status classification, retry scheduling and host-backed JSON requests.

## Limitations

Actual socket/TLS/redirect handling requires a secure providerHttpJson host. HTTPS textual checks are not SSRF prevention; DNS allowlists, redirect destination checks, certificate verification, timeout enforcement and secret storage must happen in the host. No native streaming HTTP or cookie jar is bundled.
