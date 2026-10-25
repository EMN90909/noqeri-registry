# noqeri/sentry 0.1.1 API Reference

## 28 exported functions

- sentryAlertsUrl
- sentryBodyValid
- sentryCredentialValid
- sentryDelayMillis
- sentryDelete
- sentryDsnSizeValid
- sentryEventsUrl
- sentryGet
- sentryIdentifierChar
- sentryIdentifierValid
- sentryIssuesUrl
- sentryMethodAllowed
- sentryMonitorsUrl
- sentryOrganizationProjectsUrl
- sentryOrganizationsUrl
- sentryPageSizeValid
- sentryPatch
- sentryPost
- sentryProjectsUrl
- sentryRateLimited
- sentryReleasesUrl
- sentryRequest
- sentryRetryable
- sentryRoot
- sentryStatus
- sentrySuccess
- sentryTeamsUrl
- sentryTimestampValid

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Sentry authenticated REST management routes, HTTP retry policy, DSN size constraints and lightweight event metadata handling.

## Limitations

REST management API is NOT the same as Sentry's envelope ingestion endpoint. This package does not sign sessions, build a complete Sentry envelope, capture crash stacks, or transmit events without a configured secure host.
