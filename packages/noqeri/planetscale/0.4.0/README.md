# noqeri/planetscale

Noqeri-native PlanetScale management API adapter. Service-token authentication uses the documented `SERVICE_TOKEN_ID:SERVICE_TOKEN` Authorization value. This package manages PlanetScale resources; the PlanetScale API does not expose application row data, so database traffic should use the relevant Postgres/MySQL driver.

```noqeri
import package "noqeri/planetscale"
let orgs = planetscaleListOrganizations(tokenId, token)
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
