# noqeri/url 0.5.0

RFC 3986 percent-encoding validation, application/x-www-form-urlencoded encode/decode, and bounded query parameter lookup.

0.5.0 preserves the 0.4.0 exports and adds native Noqeri functions. No Node.js dependency. This source is GPL-3.0-only. Functions with caller-provided buffers return -1 or false on invalid input; see sources for specific status values. Run `tests/regression.noqeri` using a compatible Noqeri compiler. The implementation is not claimed to support features beyond its documented subset.
