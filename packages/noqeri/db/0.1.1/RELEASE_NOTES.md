# 0.1.1 release: noqeri/db

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Actual database transactions and parameter binding require native host functions. Escaping identifiers does NOT escape data values. Never interpolate untrusted values into SQL. The native host decides isolation and durability; these functions alone offer neither.
