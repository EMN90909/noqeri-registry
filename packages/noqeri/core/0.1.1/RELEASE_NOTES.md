# core 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Byte comparison/search/copy/fill, prefix/suffix/substring matching, ASCII classification and casing, integer clamps, checked-range validation, decimal U64 parse/format and FNV-1a noncryptographic hashing.

## Known limits

Slices are borrowed from the caller. coreBytesCopy does not define overlap-safe memmove semantics. FNV is not a secure hash. Core numeric arithmetic must be tested against the compiler's selected overflow rules.
