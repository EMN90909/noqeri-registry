# noqeri/hex 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Strict hexadecimal bytes and unsigned 64-bit integer codecs with explicit size checks, overflow rejection and case handling.

The new implementation exports 12 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Byte codecs are not encryption or hashing. Unsigned formatting is base-16; no signed integer parsing. Input/output buffers are caller-managed.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
