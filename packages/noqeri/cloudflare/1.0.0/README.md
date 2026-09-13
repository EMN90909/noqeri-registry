# noqeri/cloudflare

Noqeri-native Cloudflare API wrapper. It uses scoped API tokens through bearer authentication; legacy global API keys are intentionally not the default.

```nqr
import package "noqeri/cloudflare"
let zones = cloudflareListZones(apiToken)
```
