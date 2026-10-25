# noqeri/openai

Noqeri-native OpenAI HTTP adapter centered on the Responses API. API keys are bearer credentials and must be loaded from server-side environment or secret storage, never client code.

```noqeri
import package "noqeri/openai"
let response = openaiCreateResponse(apiKey, requestJson)
```

The package intentionally wraps the HTTP API directly instead of embedding a JavaScript SDK.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
