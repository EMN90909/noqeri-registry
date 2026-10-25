# noqeri/glob 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Allocation-free wildcard matching with *, ?, optional slash-sensitive mode, backslash escapes, literal-prefix analysis and conservative malformed-pattern rejection.

The new implementation exports 8 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Byte-wise globbing, not Unicode grapheme-aware or POSIX bracket-class support. The path mode will not cross '/' for '*', and does not implement recursive **. Worst-case wildcard retries are bounded by input lengths.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
