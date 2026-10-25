# noqeri/glob 0.1.1 API Reference

## 8 exported functions

- globHasWildcard
- globLiteralPrefix
- globMagic
- globMatch
- globMatchLiteral
- globMatchMode
- globMatchPath
- globPatternValid

## 0 external host bindings


## Scope

Allocation-free wildcard matching with *, ?, optional slash-sensitive mode, backslash escapes, literal-prefix analysis and conservative malformed-pattern rejection.

## Limitations

Byte-wise globbing, not Unicode grapheme-aware or POSIX bracket-class support. The path mode will not cross '/' for '*', and does not implement recursive **. Worst-case wildcard retries are bounded by input lengths.
