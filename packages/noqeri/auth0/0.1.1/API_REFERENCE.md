# noqeri/auth0 0.1.1: API reference

**Edition:** 2026 | **License:** MIT | **Channel:** experimental / international

Source: `src/auth0.noqeri`. Every listed symbol has a real Noqeri declaration. This list is not a claim of production qualification.

## Exported functions (32)

- `auth0ApiVersion`
- `auth0CredentialPresent`
- `auth0LastStatus`
- `auth0Root`
- `auth0StatusSuccess`
- `auth0StatusUnauthorized`
- `auth0StatusRetryable`
- `auth0RetryDelayMillis`
- `auth0NameCharSafe`
- `auth0IdentifierSafe`
- `auth0BodySizeValid`
- `auth0MethodAllowed`
- `auth0Request`
- `auth0UsersUrl`
- `auth0RolesUrl`
- `auth0OrganizationsUrl`
- `auth0ClientsUrl`
- `auth0ConnectionsUrl`
- `auth0LogsUrl`
- `auth0JobsUrl`
- `auth0ResourceServersUrl`
- `auth0ActionsUrl`
- `auth0TicketsUrl`
- `auth0ManagementUrl`
- `auth0UserUrl`
- `auth0RoleUsersUrl`
- `auth0UserOrganizationsUrl`
- `auth0PageValid`
- `auth0Get`
- `auth0Post`
- `auth0Patch`
- `auth0Delete`

## External host interfaces (2)

- `providerHttpJson`
- `providerHttpStatus`

## Contract

Functions accepting `[]u8` use caller-owned byte buffers. Unless explicitly documented, they never allocate. A negative `isize` denotes invalid input or insufficient destination capacity. Some provider functions construct URLs and require trusted IDs, domains and an injected secure HTTP host.

## Testing

Run `noqeri check tests/regression.noqeri` and `noqeri run tests/regression.noqeri`. The test must print `0` and exit successfully. Provider network operations still require separate authenticated integration verification.

## Licensing

The original, newly authored 0.1.1 release is MIT-licensed. Prior package versions remain separately licensed.
