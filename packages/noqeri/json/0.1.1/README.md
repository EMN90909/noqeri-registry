# noqeri/json 0.1.1

**International preview | MIT | Noqeri Edition 2026**

JSON UTF-8 byte-oriented string-token validation, escape handling, strict number syntax and bounded object/array delimiter framing.

The new implementation exports 8 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

A lexer and framing validator, not a complete JSON AST parser or Unicode scalar decoder. Host should use a proven JSON parser for untrusted structured data requiring complete semantic validation.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
