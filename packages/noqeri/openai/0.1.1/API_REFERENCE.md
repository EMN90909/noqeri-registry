# noqeri/openai 0.1.1 API Reference

## 30 exported functions

- openaiAudioSpeechUrl
- openaiAudioTranscriptionsUrl
- openaiBatchesUrl
- openaiBodyValid
- openaiCredentialValid
- openaiDelayMillis
- openaiDelete
- openaiEmbeddingsUrl
- openaiFilesUrl
- openaiFineTuningJobsUrl
- openaiGet
- openaiIdentifierChar
- openaiIdentifierValid
- openaiImagesUrl
- openaiInputBytesValid
- openaiMethodAllowed
- openaiModelsUrl
- openaiModerationsUrl
- openaiPageSizeValid
- openaiPatch
- openaiPost
- openaiRateLimited
- openaiRequest
- openaiResponsesUrl
- openaiRetryable
- openaiRoot
- openaiStatus
- openaiSuccess
- openaiTokenLimitValid
- openaiVectorStoresUrl

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

OpenAI REST endpoint catalog, Responses API request wrapper, model and embedding operations, retry classification and safe JSON body-size constraints.

## Limitations

Not an official full SDK. Responses, images and embeddings require JSON created by a proven serializer; raw JSON concatenation is unsafe. Host owns TLS, timeouts, bearer secret storage, rate-limit handling and streaming/SSE. No automatic schema validation or model availability assertions.
