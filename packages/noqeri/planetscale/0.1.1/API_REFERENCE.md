# noqeri/planetscale 0.1.1 API Reference

## 27 exported functions

- planetscaleBodyValid
- planetscaleBranchUrl
- planetscaleBranchesUrl
- planetscaleCredentialValid
- planetscaleDatabaseUrl
- planetscaleDatabasesUrl
- planetscaleDelayMillis
- planetscaleDelete
- planetscaleDeployRequestsUrl
- planetscaleGet
- planetscaleIdentifierChar
- planetscaleIdentifierValid
- planetscaleMethodAllowed
- planetscaleOrganizationUrl
- planetscaleOrganizationsUrl
- planetscalePageSizeValid
- planetscalePasswordsUrl
- planetscalePatch
- planetscalePost
- planetscaleRateLimited
- planetscaleRegionsUrl
- planetscaleRequest
- planetscaleRetryable
- planetscaleRoot
- planetscaleServiceTokensUrl
- planetscaleStatus
- planetscaleSuccess

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

PlanetScale organization, database, branch, deploy request and password-management URL builders and scoped HTTP request contracts.

## Limitations

Management API adapter only. No database SQL driver, direct Vitess/MySQL connection, or branch schema deployment engine. Requires scoped API service tokens. Paths use caller validated identifiers.
