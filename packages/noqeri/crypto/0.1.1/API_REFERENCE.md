# noqeri/crypto 0.1.1: API reference

**Edition:** 2026 | **License:** MIT | **Channel:** experimental / international

Source: `src/crypto.noqeri`. Every listed symbol has a real Noqeri declaration. This list is not a claim of production qualification.

## Exported functions (16)

- `cryptoSha256OutputSize`
- `cryptoSha512OutputSize`
- `cryptoDigestLengthValid`
- `cryptoCanSha256`
- `cryptoRandomNonEmpty`
- `cryptoDigest`
- `cryptoDigestEqual`
- `cryptoZero`
- `cryptoHexDigit`
- `cryptoHexNibble`
- `cryptoHexEncode`
- `cryptoHexDecode`
- `cryptoHexValid`
- `cryptoXorBytes`
- `cryptoSha256Hex`
- `cryptoRandomHex`

## External host interfaces (2)

- `cryptoRandomFill`
- `cryptoSha256`

## Contract

Functions accepting `[]u8` use caller-owned byte buffers. Unless explicitly documented, they never allocate. A negative `isize` denotes invalid input or insufficient destination capacity. Some provider functions construct URLs and require trusted IDs, domains and an injected secure HTTP host.

## Testing

Run `noqeri check tests/regression.noqeri` and `noqeri run tests/regression.noqeri`. The test must print `0` and exit successfully. Provider network operations still require separate authenticated integration verification.

## Licensing

The original, newly authored 0.1.1 release is MIT-licensed. Prior package versions remain separately licensed.
