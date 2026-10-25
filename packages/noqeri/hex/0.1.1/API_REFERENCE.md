# noqeri/hex 0.1.1 API Reference

## 12 exported functions

- hexChecksumXor
- hexDecode
- hexDecodePair
- hexDecodedSize
- hexEncode
- hexEncodedSize
- hexFormatU64
- hexIsAsciiHex
- hexParseU64
- hexSymbol
- hexValid
- hexValue

## 0 external host bindings


## Scope

Strict hexadecimal bytes and unsigned 64-bit integer codecs with explicit size checks, overflow rejection and case handling.

## Limitations

Byte codecs are not encryption or hashing. Unsigned formatting is base-16; no signed integer parsing. Input/output buffers are caller-managed.
