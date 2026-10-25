# noqeri/html 0.1.1 API Reference

## 8 exported functions

- htmlAttrNameValid
- htmlControlBytesSafe
- htmlEscapeText
- htmlEscapeWidth
- htmlEscapedSize
- htmlIsSpecial
- htmlTagChar
- htmlTagValid

## 0 external host bindings


## Scope

Safe HTML text/attribute escaping, tag/attribute name validators and strict sizing of encoded text without HTML parser side effects.

## Limitations

Escapes reserved HTML syntax bytes; not a general HTML parser, DOM sanitizer, JavaScript sandbox, or URL sanitizer. Consumers still need context-aware escaping for script, CSS and URL attributes.
