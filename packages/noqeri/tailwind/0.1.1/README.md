# noqeri/tailwind 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Tailwind utility class token validation, variant separator checks, safe class list joins and breakpoint prefix inspection.

The new implementation exports 7 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Not a Tailwind CSS compiler, parser, style generator or JIT implementation. Does not verify whether arbitrary utility classes exist in a project's Tailwind version. Arbitrary [] property syntaxes are intentionally excluded.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
