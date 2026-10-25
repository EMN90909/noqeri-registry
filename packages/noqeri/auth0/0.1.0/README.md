# noqeri/auth0

Noqeri-native Auth0 Management API adapter. Production callers obtain Management API access tokens through an Auth0 machine-to-machine flow, then send them as bearer credentials.

```noqeri
import package "noqeri/auth0"
let settings = auth0Get(token, "tenant.auth0.com", "tenants/settings")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
