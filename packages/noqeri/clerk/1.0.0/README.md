# noqeri/clerk

Noqeri-native backend wrapper for Clerk's REST Backend API at `https://api.clerk.com/v1`. Backend calls use bearer secret-key authentication and must stay in trusted server code.

```noqeri
import package "noqeri/clerk"
let user = clerkGetUser(secretKey, "user_123")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
