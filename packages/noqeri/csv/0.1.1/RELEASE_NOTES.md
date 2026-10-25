# 0.1.1 release: noqeri/csv

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Parses one row at a time; this does not provide streaming I/O or an entire workbook parser. Caller supplies encoding (bytes, normally UTF-8). Complex multi-line CSV records must be collected by the host before row parsing.
