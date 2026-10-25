# 0.1.1 release: noqeri/fetch

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

The runtime must supply fetchStart, fetchStatus, fetchText, fetchCancel. This package cannot enforce DNS SSRF protection, redirect policies, TLS certificate validation or timeouts by itself. Applications should use explicit host allowlists and bounded responses.
