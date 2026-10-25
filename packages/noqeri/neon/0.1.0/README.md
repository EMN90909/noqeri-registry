# noqeri/neon

Noqeri-native adapter for Neon's PostgREST-compatible Data API. The package accepts the Data API endpoint provided by Neon and uses JWT bearer authentication, allowing Postgres RLS-backed access over HTTPS.

```nqr
import package "noqeri/neon"
let rows = neonSelect(dataApiUrl, jwt, "profiles", "select=id,name")
```
