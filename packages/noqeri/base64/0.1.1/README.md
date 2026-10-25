# noqeri/base64 0.1.1

**International preview · MIT · Noqeri edition 2026**

Allocation-free RFC 4648 Base64 and Base64URL codecs.

## Implemented in native Noqeri

Standard and URL-safe alphabets, optional padding, strict canonical validation, exact encoded/decoded lengths, rejection of unused nonzero pad bits, destination capacity handling, and round-trip encode/decode.

## Supported environment

- Source: `src/base64.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/base64.noqeri"

    let bytes: [u8; 1] = [77 as u8]
    let output: [u8; 4] = [0 as u8,0 as u8,0 as u8,0 as u8]
    print(base64Encode(slice(bytes),slice(output)))
```

## Contracts and security

Caller owns input/output byte arrays. Returned -1 indicates invalid input or insufficient destination space. This module is not encryption, compression, or a Unicode text conversion tool.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
