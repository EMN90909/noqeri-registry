# noqeri/neon

Noqeri-native adapter for Neon's PostgREST-compatible Data API. The package accepts the Data API endpoint provided by Neon and uses JWT bearer authentication, allowing Postgres RLS-backed access over HTTPS.

```noqeri
import package "noqeri/neon"
let rows = neonSelect(dataApiUrl, jwt, "profiles", "select=id,name")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
