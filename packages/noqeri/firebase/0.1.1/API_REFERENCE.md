# noqeri/firebase 0.1.1 API Reference

## 24 exported functions

- firebaseAuthLookupUrl
- firebaseAuthPasswordResetUrl
- firebaseAuthRequest
- firebaseAuthRoot
- firebaseAuthSignInUrl
- firebaseAuthSignUpUrl
- firebaseCommit
- firebaseCommitUrl
- firebaseCredentialPresent
- firebaseDocumentUrl
- firebaseDocumentsRoot
- firebaseFirestoreRoot
- firebaseGetDocument
- firebaseIdentifierAllowed
- firebaseLastStatus
- firebaseProjectIdValid
- firebaseRetryable
- firebaseRunQuery
- firebaseRunQueryUrl
- firebaseSignInPassword
- firebaseSignUp
- firebaseSuccess
- firebaseTokenRefreshUrl
- firebaseTokenRoot

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Firebase Auth REST v1 and Cloud Firestore REST v1 route helpers, API-key credential checks, bearer request wrappers and quota/error classification.

## Limitations

This is a host-backed REST adapter, not the Firebase SDK. Callers must supply correctly serialized JSON, configured project IDs and encoded document paths. Authentication/token refresh, DNS allowlisting, retry jitter, Firestore transaction semantics and security rules enforcement belong to host and server.
