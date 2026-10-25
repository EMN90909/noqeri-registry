# noqeri/http-server 0.1.1 API Reference

## 15 exported functions

- httpServerBodyAllowed
- httpServerDefaultPort
- httpServerHandleValid
- httpServerHeaderCountValid
- httpServerHeaderNameValid
- httpServerHeaderValueValid
- httpServerMethodSafe
- httpServerMethodValid
- httpServerPortValid
- httpServerRedirectStatusValid
- httpServerRequestBodyMax
- httpServerRouteValid
- httpServerStart
- httpServerStatusValid
- httpServerStop

## 2 external host bindings

- httpServerClose
- httpServerListen

## Scope

HTTP server host adapter with validated port and status rules, method/route safety checks, response-header validation, and bounded request metadata.

## Limitations

A native HTTP listener, TLS, routing dispatch and I/O lifecycle must be provided by the host. This package cannot itself accept sockets or parse RFC 9110 HTTP messages. Path validation is byte-oriented and does not replace URL decoding or authorization. Never write unescaped content to HTML.
