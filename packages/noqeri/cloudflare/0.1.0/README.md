# noqeri/cloudflare

Noqeri-native Cloudflare API wrapper. It uses scoped API tokens through bearer authentication; legacy global API keys are intentionally not the default.

```noqeri
import package "noqeri/cloudflare"
let zones = cloudflareListZones(apiToken)
```
