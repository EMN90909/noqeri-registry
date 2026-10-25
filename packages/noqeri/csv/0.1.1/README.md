# noqeri/csv 0.1.1

**International preview | MIT | Noqeri Edition 2026**

RFC-4180-style CSV field decoding, encoding, row delimiter handling and strict quoted-field validation, with caller-owned buffers.

The new implementation exports 10 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Parses one row at a time; this does not provide streaming I/O or an entire workbook parser. Caller supplies encoding (bytes, normally UTF-8). Complex multi-line CSV records must be collected by the host before row parsing.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
