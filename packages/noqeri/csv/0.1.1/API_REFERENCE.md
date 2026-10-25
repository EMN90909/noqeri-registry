# noqeri/csv 0.1.1 API Reference

## 10 exported functions

- csvCellValid
- csvDecodeCell
- csvDecodedSize
- csvDelimiterValid
- csvEncodeCell
- csvFieldsCount
- csvHeaderSafe
- csvIsNewline
- csvNeedsQuoting
- csvQuotedSize

## 0 external host bindings


## Scope

RFC-4180-style CSV field decoding, encoding, row delimiter handling and strict quoted-field validation, with caller-owned buffers.

## Limitations

Parses one row at a time; this does not provide streaming I/O or an entire workbook parser. Caller supplies encoding (bytes, normally UTF-8). Complex multi-line CSV records must be collected by the host before row parsing.
