# crypto 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

CSPRNG and SHA256 host contracts, 32/64-byte digest sizing, hexadecimal codec, digest comparison, buffer zeroing, XOR transform and SHA256/random hexadecimal helpers.

## Known limits

The Noqeri package does not independently supply a secure RNG or hashing backend: cryptoRandomFill and cryptoSha256 must be implemented by a properly secured host. XOR is not encryption. Byte comparison and wiping carry no guaranteed constant-time or optimized-memory-elision property without backend verification.
