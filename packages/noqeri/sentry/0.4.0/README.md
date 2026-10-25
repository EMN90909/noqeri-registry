# noqeri/sentry

Noqeri-native Sentry Web API wrapper using bearer authentication tokens. It targets management/observability API calls rather than pretending to be a full native crash SDK.

```noqeri
import package "noqeri/sentry"
let projects = sentryListProjects(token, "my-org")
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
