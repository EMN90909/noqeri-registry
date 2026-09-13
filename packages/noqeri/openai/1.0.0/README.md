# noqeri/openai

Noqeri-native OpenAI HTTP adapter centered on the Responses API. API keys are bearer credentials and must be loaded from server-side environment or secret storage, never client code.

```nqr
import package "noqeri/openai"
let response = openaiCreateResponse(apiKey, requestJson)
```

The package intentionally wraps the HTTP API directly instead of embedding a JavaScript SDK.
