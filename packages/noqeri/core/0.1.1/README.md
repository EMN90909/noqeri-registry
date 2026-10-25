# noqeri/core 0.1.1

**International preview · MIT · Noqeri edition 2026**

Portable bounded memory and numeric utilities.

## Implemented in native Noqeri

Byte comparison/search/copy/fill, prefix/suffix/substring matching, ASCII classification and casing, integer clamps, checked-range validation, decimal U64 parse/format and FNV-1a noncryptographic hashing.

## Supported environment

- Source: `src/core.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/core.noqeri"

    let data: [u8; 3] = [65 as u8,66 as u8,67 as u8]
    print(coreBytesIndexOf(slice(data),66 as u8))
```

## Contracts and security

Slices are borrowed from the caller. coreBytesCopy does not define overlap-safe memmove semantics. FNV is not a secure hash. Core numeric arithmetic must be tested against the compiler's selected overflow rules.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
