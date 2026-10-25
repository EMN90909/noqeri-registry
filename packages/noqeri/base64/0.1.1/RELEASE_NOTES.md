# base64 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Standard and URL-safe alphabets, optional padding, strict canonical validation, exact encoded/decoded lengths, rejection of unused nonzero pad bits, destination capacity handling, and round-trip encode/decode.

## Known limits

Caller owns input/output byte arrays. Returned -1 indicates invalid input or insufficient destination space. This module is not encryption, compression, or a Unicode text conversion tool.
