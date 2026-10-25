# 0.1.1 release: noqeri/glob

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Byte-wise globbing, not Unicode grapheme-aware or POSIX bracket-class support. The path mode will not cross '/' for '*', and does not implement recursive **. Worst-case wildcard retries are bounded by input lengths.
