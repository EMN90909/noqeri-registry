# noqeri/http-client

Noqeri-native HTTP provider contract used by official service packages. It keeps request validation and success semantics in `.noqeri`; the host supplies HTTPS transport. No JavaScript SDK is required by package source.

```noqeri
import package "noqeri/http-client"
let body = httpClientJson("GET", "https://example.com/api", token, "")
```

Production hosts must enforce TLS verification, redirect policy, timeouts, response limits, DNS/private-network protections and secret redaction.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
