# noqeri/convex 0.1.1: API reference

**Edition:** 2026 | **License:** MIT | **Channel:** experimental / international

Source: `src/convex.noqeri`. Every listed symbol has a real Noqeri declaration. This list is not a claim of production qualification.

## Exported functions (28)

- `convexApiVersion`
- `convexCredentialPresent`
- `convexLastStatus`
- `convexRoot`
- `convexStatusSuccess`
- `convexStatusUnauthorized`
- `convexStatusRetryable`
- `convexRetryDelayMillis`
- `convexNameCharSafe`
- `convexIdentifierSafe`
- `convexBodySizeValid`
- `convexMethodAllowed`
- `convexRequest`
- `convexQueryUrl`
- `convexMutationUrl`
- `convexActionUrl`
- `convexRunUrl`
- `convexFunctionSpecUrl`
- `convexFunctionPathValid`
- `convexIsIdentifierChar`
- `convexRequestBody`
- `convexQuery`
- `convexMutation`
- `convexAction`
- `convexQueryFunction`
- `convexMutationFunction`
- `convexActionFunction`
- `convexRetryableStatus`

## External host interfaces (2)

- `providerHttpJson`
- `providerHttpStatus`

## Contract

Functions accepting `[]u8` use caller-owned byte buffers. Unless explicitly documented, they never allocate. A negative `isize` denotes invalid input or insufficient destination capacity. Some provider functions construct URLs and require trusted IDs, domains and an injected secure HTTP host.

## Testing

Run `noqeri check tests/regression.noqeri` and `noqeri run tests/regression.noqeri`. The test must print `0` and exit successfully. Provider network operations still require separate authenticated integration verification.

## Licensing

The original, newly authored 0.1.1 release is MIT-licensed. Prior package versions remain separately licensed.
