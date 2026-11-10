# noqeri/uuid 0.5.0

Validated UUID binary decode/encode and RFC 4122 version-4 formatting using caller-provided cryptographic random bytes.

This release preserves existing 0.4.0 exports and adds working pure-Noqeri helpers. This code requires the Noqeri compiler and runtime; no JavaScript or Node.js is used.

Use `noqeri pkg add noqeri/uuid@0.5.0`. Run `tests/regression.noqeri` with a compatible compiler. New code is not a substitute for a full general-purpose parser or platform runtime unless explicitly documented.

License: GPL-3.0-only (the existing 0.4.0 source license).
