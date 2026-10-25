# noqeri/neon 0.1.1 API Reference

## 29 exported functions

- neonApiKeysUrl
- neonBodyValid
- neonBranchUrl
- neonBranchesUrl
- neonCredentialValid
- neonDatabasesUrl
- neonDelayMillis
- neonDelete
- neonEndpointsUrl
- neonGet
- neonIdentifierChar
- neonIdentifierValid
- neonLimitValid
- neonMethodAllowed
- neonOperationsUrl
- neonOrganizationsUrl
- neonPageSizeValid
- neonPatch
- neonPost
- neonProjectIdValid
- neonProjectUrl
- neonProjectsUrl
- neonRateLimited
- neonRequest
- neonRetryable
- neonRolesUrl
- neonRoot
- neonStatus
- neonSuccess

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Neon management API v2 projects, branches, compute endpoints, databases, roles, and organization route constructors, with a credential-guarded request transport.

## Limitations

HTTP host and scoped Neon API tokens are required. Database SQL access is not implemented here. No credential storage or automatic branch failover. Project, branch and role IDs must be validated and URL-encoded by the caller.
