# noqeri/dom 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Host DOM adapter with CSS ID validation, safe element and attribute names, text-only mutation helpers, and explicit host-handle lifetime checks.

The new implementation exports 11 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

DOM access requires a browser or embedded DOM host. Attribute helpers deliberately reject event-handler and HTML-bearing attribute names; they do not sanitize URL attributes or CSS strings. No browser integration is bundled.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
