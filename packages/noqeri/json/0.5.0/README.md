# noqeri/json 0.5.0

Complete bounded recursive JSON document validation with strict number, string, literal, array and object grammar; no AST allocation.

This release preserves existing 0.4.0 exports and adds working pure-Noqeri helpers. This code requires the Noqeri compiler and runtime; no JavaScript or Node.js is used.

Use `noqeri pkg add noqeri/json@0.5.0`. Run `tests/regression.noqeri` with a compatible compiler. New code is not a substitute for a full general-purpose parser or platform runtime unless explicitly documented.

License: GPL-3.0-only (the existing 0.4.0 source license).
