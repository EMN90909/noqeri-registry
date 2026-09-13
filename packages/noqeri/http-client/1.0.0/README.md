# noqeri/http-client

Noqeri-native HTTP provider contract used by official service packages. It keeps request validation and success semantics in `.nqr`; the host supplies HTTPS transport. No JavaScript SDK is required by package source.

```nqr
import package "noqeri/http-client"
let body = httpClientJson("GET", "https://example.com/api", token, "")
```

Production hosts must enforce TLS verification, redirect policy, timeouts, response limits, DNS/private-network protections and secret redaction.
