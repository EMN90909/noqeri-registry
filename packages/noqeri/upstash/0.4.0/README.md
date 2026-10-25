# noqeri/upstash

Noqeri-native Upstash Redis REST client. Commands can be expressed as Redis-compatible path components or JSON bodies; the token is sent as a bearer credential.

```noqeri
import package "noqeri/upstash"
let result = upstashCommand(restUrl, token, "get/session:42")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
