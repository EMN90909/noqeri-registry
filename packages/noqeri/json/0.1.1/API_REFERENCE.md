# noqeri/json 0.1.1 API Reference

## 8 exported functions

- jsonDigit
- jsonHex
- jsonNumberValid
- jsonQuoteAscii
- jsonSkipSpace
- jsonStringEscapedSize
- jsonStringTokenValid
- jsonWhitespace

## 0 external host bindings


## Scope

JSON UTF-8 byte-oriented string-token validation, escape handling, strict number syntax and bounded object/array delimiter framing.

## Limitations

A lexer and framing validator, not a complete JSON AST parser or Unicode scalar decoder. Host should use a proven JSON parser for untrusted structured data requiring complete semantic validation.
