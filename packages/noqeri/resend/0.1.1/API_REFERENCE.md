# noqeri/resend 0.1.1 API Reference

## 28 exported functions

- resendApiKeysUrl
- resendAudiencesUrl
- resendBodyValid
- resendBroadcastsUrl
- resendContactsUrl
- resendCredentialValid
- resendDelayMillis
- resendDelete
- resendDomainUrl
- resendDomainsUrl
- resendEmailShape
- resendEmailUrl
- resendEmailsUrl
- resendGet
- resendIdentifierChar
- resendIdentifierValid
- resendMethodAllowed
- resendPageSizeValid
- resendPatch
- resendPost
- resendRateLimited
- resendRequest
- resendRetryable
- resendRoot
- resendStatus
- resendSuccess
- resendTemplatesUrl
- resendWebhooksUrl

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Resend email delivery, domains, broadcasts and templates URL and request helper utilities, including bounded retry and email address shape validation.

## Limitations

Requires verified sender/domain and a secure HTTP host. Sending emails is an external side effect. Recipient consent, unsubscribe headers, HTML sanitization and spam controls are caller responsibilities. Endpoint availability varies by API version.
