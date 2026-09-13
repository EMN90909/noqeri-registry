# noqeri/sentry

Noqeri-native Sentry Web API wrapper using bearer authentication tokens. It targets management/observability API calls rather than pretending to be a full native crash SDK.

```nqr
import package "noqeri/sentry"
let projects = sentryListProjects(token, "my-org")
```
