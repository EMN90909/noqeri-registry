# noqeri/router 0.1.1 API Reference

## 6 exported functions

- routerMatch
- routerParameterChar
- routerParameterNameValid
- routerPatternValid
- routerRouteLengthValid
- routerSegments

## 0 external host bindings


## Scope

Strict route pattern validation, colon-parameter matching, path character restrictions, suffix/prefix route inspection and bounded match operations.

## Limitations

No URL decoder, HTTP middleware registry, trie storage or host server integration. Host must decode URL paths exactly once and reject encoded separators/traversal. Parameters are matched by segment, without type conversion.
