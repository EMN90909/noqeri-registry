# Noqeri official ecosystem roadmap

Noqeri 1.0 begins the move from a compiler-focused repository into a usable application ecosystem. The complete 200-library roadmap is organized across core language foundations, memory/collections, text/encodings, numerics, I/O/filesystem, OS services, concurrency, networking, web protocols, serialization, databases, security, web applications, testing/tooling, compiler interoperability, media, GUI, scientific computing, AI, and distributed/cloud systems.

## 1.0 implemented/usable surfaces

Core/std/security/test plus json, http, http-server, url, html, web, dom, fetch, router, fs, env, crypto, db, time and websocket are published as 1.0 package surfaces. Browser implementations are supplied by the `.nqo` runtime. Server-only interfaces require a host provider. PostgreSQL, SQLite interoperability, low-level net and TLS are explicitly experimental until provider implementations and integration tests exist.

## Production rule

A roadmap name is not treated as implemented merely because it has been proposed. The registry marks capability-only/provider-dependent packages as experimental, and future additions must include compile tests plus runtime/integration tests before being promoted.

The source roadmap contains 200 planned modules/packages; this repository will promote them in tested layers rather than publishing 200 empty placeholders.
