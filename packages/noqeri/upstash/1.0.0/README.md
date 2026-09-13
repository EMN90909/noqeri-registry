# noqeri/upstash

Noqeri-native Upstash Redis REST client. Commands can be expressed as Redis-compatible path components or JSON bodies; the token is sent as a bearer credential.

```nqr
import package "noqeri/upstash"
let result = upstashCommand(restUrl, token, "get/session:42")
```
