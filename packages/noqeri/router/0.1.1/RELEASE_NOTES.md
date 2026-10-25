# 0.1.1 release: noqeri/router

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

No URL decoder, HTTP middleware registry, trie storage or host server integration. Host must decode URL paths exactly once and reject encoded separators/traversal. Parameters are matched by segment, without type conversion.
