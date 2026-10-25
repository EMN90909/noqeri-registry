# noqeri/convex

Noqeri-native wrapper for Convex public Functions HTTP API. Query, mutation and action calls target `/api/query`, `/api/mutation` and `/api/action`; optional user authentication is a bearer token.

```noqeri
import package "noqeri/convex"
let result = convexQuery(deploymentUrl, userToken, "{\"path\":\"messages:list\",\"args\":{},\"format\":\"json\"}")
```
