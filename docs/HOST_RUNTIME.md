# Go host runtime for Noqeri packages (experimental v1)

This is the **first executable host service** replacing `providerHttpJson`, `providerHttpStatus` and the database host stubs conceptually used by the MIT `0.1.1` packages. The process performs real HTTPS requests and parameterized SQLite/PostgreSQL queries. It is **not** a claim that the Stage-0 Noqeri interpreter/native ABI is wired to these services yet. See the explicit ABI boundary below.

## Architecture

- `cmd/noqeri-host`: a local-only stdin/stdout JSON-lines process. It does **not** open a listening TCP socket or expose a web service.
- `internal/hostbridge/http.go`: allowlisted HTTPS API calls for Auth0, Clerk, Cloudflare, Convex, Firebase, GitHub, Neon, OpenAI, PlanetScale, Resend, Sentry, Stripe and Supabase.
- `internal/hostbridge/db.go`: safe `database/sql` handles and parameterized transactions for SQLite and PostgreSQL.
- `internal/hostbridge/host.go`: the bounded v1 request/response protocol.
- `cmd/noqeri-host/drivers.go`: real PostgreSQL `pgx/stdlib` and CGo-free `modernc.org/sqlite` drivers behind `-tags dbdrivers`.

The runtime is designed to be spawned only by a trusted local application; stdin access is a privileged capability. Do **not** expose it as an unauthenticated web endpoint.

## Build

```sh
# Install/pin the drivers using the versions in the committed go.mod/go.sum.
go build -tags dbdrivers -o build/noqeri-host ./cmd/noqeri-host
# Or run from the repository root:
go run -tags dbdrivers ./cmd/noqeri-host
```

Only Go + native SQL drivers are needed for this layer. No JavaScript, Python, or C++ bridge is required. The Go command without the `dbdrivers` tag still handles HTTP, but database opens report `database_driver_not_linked` instead of pretending to work.

## Protocol and examples

Each line is a JSON object. Responses have `v:1`, the matching `id`, `ok`, and optional `status`, `body`, `handle`, `affected`, `columns`, `rows`, or a sanitized `error` code. Every input frame has a 2 MiB limit and requests use a 12-second deadline. Body strings are capped at 1 MiB.

```json
{"v":1,"id":"a1","op":"ping"}
{"v":1,"id":"g1","op":"http","provider":"github","method":"GET","url":"https://api.github.com/rate_limit"}
{"v":1,"id":"p1","op":"db_open","driver":"postgres"}
{"v":1,"id":"q1","op":"db_query","handle":1,"query":"SELECT $1::integer AS answer","args":[42]}
{"v":1,"id":"c1","op":"db_close","handle":1}
```

The `db_open` handle is allocated by the host and must be read from the response; `1` above is illustrative. SQLite uses `?` placeholders and Postgres uses `$1`, `$2`, etc. Transactions: `db_begin`, parameterized `db_exec` / `db_query`, followed by `db_commit` or `db_rollback`. No SQL interpolation is performed. Up to 8 database handles, 64 arguments, 64 result columns, 500 result rows, and 64 KiB per result cell are accepted.

## Environment-provided credentials (never sent over IPC)

The host reads `NOQERI_{PROVIDER}_TOKEN` from its own environment for each API provider, for example `NOQERI_GITHUB_TOKEN`, `NOQERI_AUTH0_TOKEN`, `NOQERI_OPENAI_TOKEN`, and `NOQERI_STRIPE_TOKEN`. **Do not store credentials in source files, shell history or CI logs.** Use your secret manager or a protected runtime environment. The stdin protocol cannot choose arbitrary secret-variable names.

Provider-specific details:

- **Supabase:** project Data API uses `NOQERI_SUPABASE_TOKEN` as an `apikey` (new `sb_secret_*` / publishable keys are not JWTs), plus optional `NOQERI_SUPABASE_JWT` for an end-user identity and RLS. Management API uses bearer credentials. Secret keys bypass RLS and must only be used in trusted backend contexts.
- **Stripe:** requests use `application/x-www-form-urlencoded`, and `NOQERI_STRIPE_IDEMPOTENCY_KEY` can provide a valid idempotency key for POST. The host does not implement webhook signature verification or automatic confirmation of financial effects.
- **PlanetScale:** set `NOQERI_PLANETSCALE_TOKEN_ID` and `NOQERI_PLANETSCALE_TOKEN`; the Authorization header is `<id>:<token>`.
- **Firebase Auth:** the configured API key (`NOQERI_FIREBASE_TOKEN`) is passed in the `key` query parameter to identitytoolkit/securetoken. Firestore uses OAuth bearer tokens.
- **PostgreSQL:** `NOQERI_POSTGRES_DSN` must be a PostgreSQL URL with `?sslmode=verify-full` and a server identity/certificate that validates. All SQL inputs are bound parameters. Do not embed it in a source file.
- **SQLite:** `NOQERI_SQLITE_PATH` points to an operator-controlled file; in-memory and `file:` URI modes are intentionally blocked. This does not restrict all symlink attacks; the host must be deployed in a filesystem sandbox.

Never run privileged service credentials inside a browser, a shared public REPL, or a publicly callable runtime. GitHub Actions **never** uses real API keys unless an operator explicitly sets them in a secret-enabled, restricted environment.

## Network security

- HTTPS only, TLS 1.2 minimum, provider-specific DNS name allowlist.
- Denies literal-IP URLs, private and link-local DNS destinations (including metadata endpoints), non-443 ports, userinfo, and encoded slashes.
- DNS is resolved at actual connection time and pinned to a public IP (preventing DNS rebinding).
- Disables automatic redirects and proxy environment forwarding.
- Bounded response bodies, headers, timeouts and connection pools. No raw HTTP headers are accepted from stdin.
- Errors are generic; secret values, DSNs and upstream URL strings are never written to logs.

Provider operations do **not** automatically retry non-idempotent writes. Handling pagination, conditional requests, vendor-specific errors, auth refresh, and signed webhooks remains up to the caller or a dedicated provider implementation.

## Tests

```sh
go test ./internal/hostbridge ./cmd/noqeri-host
go test -race ./internal/hostbridge
# Includes a real SQLite SQL transaction/rollback test:
go test -tags dbdrivers ./internal/hostbridge ./cmd/noqeri-host
```

Unit tests use a fake HTTPS transport and fake database driver. Real SQLite integration creates and removes its own temporary DB file. PostgreSQL and live external APIs are **opt-in**, only using read-only verification and preconfigured secrets.

```sh
# Example: read-only access only, using a restricted token supplied securely.
NOQERI_RUN_LIVE_TESTS=1 \
NOQERI_LIVE_PROVIDER=github \
NOQERI_LIVE_READONLY_URL=https://api.github.com/rate_limit \
go test -tags dbdrivers ./internal/hostbridge -run Live
```

No live provider authentication or payment flows can be claimed as tested without the respective legitimate credentials and test environment. The CI default deliberately skips these tests.

## Important remaining integration gate

The official Noqeri FFI documentation currently states that ordinary `extern` symbols are **not** a stable, portable Go/C interface on every native target. A complete bridge from the Noqeri language's `providerHttpJson` and SQL extern calls to this process requires an ABI-v2 service adapter (or a documented Noqeri process/stdin primitive) and cross-platform conformance tests. This Go process is usable by a trusted launcher today, but pure Noqeri package code **cannot yet transparently call it** without that adapter. The existing package algorithms and release regressions are separate from these host integration tests.
