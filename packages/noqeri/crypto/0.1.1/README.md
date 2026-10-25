# noqeri/crypto 0.1.1

**International preview · MIT · Noqeri edition 2026**

Cryptographic provider boundary plus validated bytes/digest codecs.

## Implemented in native Noqeri

CSPRNG and SHA256 host contracts, 32/64-byte digest sizing, hexadecimal codec, digest comparison, buffer zeroing, XOR transform and SHA256/random hexadecimal helpers.

## Supported environment

- Source: `src/crypto.noqeri`, with bytecode extension `.nqri`.
- No JavaScript or Python dependency.
- Portable value and byte operations; provider networking requires explicit host bindings.
- No backwards-compatibility promise for earlier experimental releases.
- Error codes are explicit; utilities fail on malformed inputs or too-small destinations.

## Example

```noqeri
import "../src/crypto.noqeri"

    let data: [u8; 2] = [170 as u8,255 as u8]
    let encoded: [u8; 4] = [0 as u8,0 as u8,0 as u8,0 as u8]
    print(cryptoHexEncode(slice(data),slice(encoded),false))
```

## Contracts and security

The Noqeri package does not independently supply a secure RNG or hashing backend: cryptoRandomFill and cryptoSha256 must be implemented by a properly secured host. XOR is not encryption. Byte comparison and wiping carry no guaranteed constant-time or optimized-memory-elision property without backend verification.

## Test instructions

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

A final `0` means the pure-logic regression program passed. Do not interpret a passing compiler run as evidence of the external provider service being reachable or authorized.

## License

Original 0.1.1 implementation is offered under the MIT License, subject to its copyright notices. Prior version directories retain their original licensing. See the repository's LICENSES documentation.
