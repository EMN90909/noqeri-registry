# noqeri/std 1.6.0

GPL-3.0-only portable facade for the Noqeri 1.6 standard-library baseline.

This release marks the aggregate-generic collection milestone: the compiler can specialise generic records such as `List<T>` and `Map<K,V>` into predictable concrete layouts while retaining inferred generic functions. It also standardises Noqeri's lightweight error encoding (`throw code` -> `-(code + 1)`) and exposes helpers that correctly bridge low-level status values to application-facing error records.

The canonical standard-library implementation remains bundled with `EMN90909/Noqeri` under `Lib/std`. This registry package is intentionally a small version/capability facade rather than a duplicated copy of every std module.

Key guarantees exposed here include portable status/range checks, separate AES/RSA key policies, aggregate-generic descriptors, and GPL-3.0-only licensing.
