# noqeri/base64 0.1.1: API reference

**Edition:** 2026 | **License:** MIT | **Channel:** experimental / international

Source: `src/base64.noqeri`. Every listed symbol has a real Noqeri declaration. This list is not a claim of production qualification.

## Exported functions (22)

- `base64AlphabetValue`
- `base64UrlAlphabetValue`
- `base64Digit`
- `base64UrlDigit`
- `base64EncodedLength`
- `base64EncodedUrlLength`
- `base64DecodedMaxLength`
- `base64ValidateMode`
- `base64Valid`
- `base64UrlValid`
- `base64CharValid`
- `base64UrlCharValid`
- `base64LengthValid`
- `base64DecodedLengthMode`
- `base64DecodedLength`
- `base64DecodedUrlLength`
- `base64EncodeMode`
- `base64Encode`
- `base64EncodeUrl`
- `base64DecodeMode`
- `base64Decode`
- `base64DecodeUrl`

## External host interfaces (0)

None. Pure library requiring no external runtime ABI.

## Contract

Functions accepting `[]u8` use caller-owned byte buffers. Unless explicitly documented, they never allocate. A negative `isize` denotes invalid input or insufficient destination capacity. Some provider functions construct URLs and require trusted IDs, domains and an injected secure HTTP host.

## Testing

Run `noqeri check tests/regression.noqeri` and `noqeri run tests/regression.noqeri`. The test must print `0` and exit successfully. Provider network operations still require separate authenticated integration verification.

## Licensing

The original, newly authored 0.1.1 release is MIT-licensed. Prior package versions remain separately licensed.
