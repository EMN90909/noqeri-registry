# noqeri/auth0

Noqeri-native Auth0 Management API adapter. Production callers obtain Management API access tokens through an Auth0 machine-to-machine flow, then send them as bearer credentials.

```nqr
import package "noqeri/auth0"
let settings = auth0Get(token, "tenant.auth0.com", "tenants/settings")
```
