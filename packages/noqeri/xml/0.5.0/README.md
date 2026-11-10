# noqeri/xml 0.5.0

XML text and attribute escaping with exact buffer sizing, numeric entity guard and bounded output; not a full validating XML parser.

0.5.0 preserves the 0.4.0 exports and adds native Noqeri functions. No Node.js dependency. This source is GPL-3.0-only. Functions with caller-provided buffers return -1 or false on invalid input; see sources for specific status values. Run `tests/regression.noqeri` using a compatible Noqeri compiler. The implementation is not claimed to support features beyond its documented subset.
