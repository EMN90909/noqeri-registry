# noqeri/dom 0.1.1 API Reference

## 11 exported functions

- domAsciiDigit
- domAsciiLetter
- domAttributeAllowed
- domAttributeValueMax
- domCssIdValid
- domFindChecked
- domRemoveChecked
- domSetTextChecked
- domTagValid
- domTextValueSafe
- domValidHandle

## 4 external host bindings

- domFind
- domRemove
- domSetAttribute
- domSetText

## Scope

Host DOM adapter with CSS ID validation, safe element and attribute names, text-only mutation helpers, and explicit host-handle lifetime checks.

## Limitations

DOM access requires a browser or embedded DOM host. Attribute helpers deliberately reject event-handler and HTML-bearing attribute names; they do not sanitize URL attributes or CSS strings. No browser integration is bundled.
