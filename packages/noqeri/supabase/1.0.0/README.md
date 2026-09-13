# noqeri/supabase

Native Noqeri wrapper for Supabase Data REST, Auth and Storage URL surfaces. Data requests use the project API key and optional user bearer token so Supabase Row Level Security can remain the authorization boundary.

```nqr
import package "noqeri/supabase"
let rows = supabaseSelect(url, publishableKey, userJwt, "profiles", "select=id,name")
```

Use publishable/anon keys in client-capable code only as intended by Supabase; secret/service-role credentials belong on trusted servers. The package contains `.nqr`, not a JavaScript SDK.
