# noqeri/convex

Noqeri-native wrapper for Convex public Functions HTTP API. Query, mutation and action calls target `/api/query`, `/api/mutation` and `/api/action`; optional user authentication is a bearer token.

```noqeri
import package "noqeri/convex"
let result = convexQuery(deploymentUrl, userToken, "{\"path\":\"messages:list\",\"args\":{},\"format\":\"json\"}")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
