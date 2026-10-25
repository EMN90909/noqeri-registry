# 0.1.1 release: noqeri/http-client

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Actual socket/TLS/redirect handling requires a secure providerHttpJson host. HTTPS textual checks are not SSRF prevention; DNS allowlists, redirect destination checks, certificate verification, timeout enforcement and secret storage must happen in the host. No native streaming HTTP or cookie jar is bundled.
