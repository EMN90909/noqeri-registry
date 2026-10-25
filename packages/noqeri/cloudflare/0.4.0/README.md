# noqeri/cloudflare

Noqeri-native Cloudflare API wrapper. It uses scoped API tokens through bearer authentication; legacy global API keys are intentionally not the default.

```noqeri
import package "noqeri/cloudflare"
let zones = cloudflareListZones(apiToken)
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
