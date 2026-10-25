# noqeri/html 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Safe HTML text/attribute escaping, tag/attribute name validators and strict sizing of encoded text without HTML parser side effects.

The new implementation exports 8 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Escapes reserved HTML syntax bytes; not a general HTML parser, DOM sanitizer, JavaScript sandbox, or URL sanitizer. Consumers still need context-aware escaping for script, CSS and URL attributes.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
