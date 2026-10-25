# noqeri/openai 0.1.1

**International preview | MIT | Noqeri Edition 2026**

OpenAI REST endpoint catalog, Responses API request wrapper, model and embedding operations, retry classification and safe JSON body-size constraints.

The new implementation exports 30 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Not an official full SDK. Responses, images and embeddings require JSON created by a proven serializer; raw JSON concatenation is unsafe. Host owns TLS, timeouts, bearer secret storage, rate-limit handling and streaming/SSE. No automatic schema validation or model availability assertions.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
