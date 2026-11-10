# noqeri/turso 0.5.0

Turso/libSQL JSON pipeline helpers with size bounds, status policy, validated HTTPS-host matching and credential checks. No native SQL protocol implementation.

The v0.4.0 API remains available with expanded Noqeri-authored methods. Any `extern` provider functionality needs a trusted host; availability of native HTTPS or WebSocket implementations varies by runtime. Caller-supplied string URLs and credentials must be validated and scoped at the host boundary. No Node.js dependency. GPL-3.0-only. Tests are included but have not been executed locally.
