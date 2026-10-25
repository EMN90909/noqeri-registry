# noqeri/supabase 0.1.1 API Reference

## 30 exported functions

- supabaseApiKeysUrl
- supabaseAuthRoot
- supabaseBodyValid
- supabaseBranchesUrl
- supabaseCredentialValid
- supabaseDataRoot
- supabaseDelayMillis
- supabaseDelete
- supabaseDomainsUrl
- supabaseEdgeFunctionsRoot
- supabaseFunctionsUrl
- supabaseGet
- supabaseIdentifierChar
- supabaseIdentifierValid
- supabaseMethodAllowed
- supabaseOrganizationsUrl
- supabasePageSizeValid
- supabasePatch
- supabasePost
- supabaseProjectUrl
- supabaseProjectsUrl
- supabaseRateLimited
- supabaseRequest
- supabaseRetryable
- supabaseRoot
- supabaseSecretsUrl
- supabaseStatus
- supabaseStorageRoot
- supabaseSuccess
- supabaseTableUrl

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Supabase project management and project-scoped REST/Auth/Storage/Functions endpoint builders, with bounded request policies.

## Limitations

Management API, PostgREST, Auth and Storage use distinct authentication schemes. The host must handle service-role secrets safely and enforce RLS/tenant boundaries. SQL migrations, realtime subscriptions and signed storage URLs are not implemented.
