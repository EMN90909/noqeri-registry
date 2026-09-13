# noqeri/planetscale

Noqeri-native PlanetScale management API adapter. Service-token authentication uses the documented `SERVICE_TOKEN_ID:SERVICE_TOKEN` Authorization value. This package manages PlanetScale resources; the PlanetScale API does not expose application row data, so database traffic should use the relevant Postgres/MySQL driver.

```nqr
import package "noqeri/planetscale"
let orgs = planetscaleListOrganizations(tokenId, token)
```
