# noqeri/std 1.5.0

GPL-3.0-only registry facade for the Noqeri 1.5 standard-library foundation.

The compiler repository owns the bundled `Lib/std` implementation. This registry package supplies a portable compatibility surface, standard status/range checks, generic collection probing, and a version contract for package consumers.

The 1.5 foundation contains more than 100 standard-library modules spanning math, text/Unicode, bytes/encoding, generic collection operations, IO/filesystem/process, time/date, structured data, networking/HTTP/WebSocket/TLS, security parameter policy, SQL/database, concurrency, testing/debug/profile and related utilities.

Aggregate container syntax such as `List<T>`/`Map<K,V>` remains a compiler-language milestone; the 1.5 library uses the currently supported inferred generic functions over slices rather than fabricating type-specific package aliases.
