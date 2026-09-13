# Official provider packages

The registry now carries Noqeri-authored adapters for common hosted services. Package implementation is `.nqr`; JavaScript SDKs are not embedded into these packages.

Use the new package import form:

```nqr
import package "noqeri/supabase"
import package "noqeri/firebase"
```

Then declare/pin dependencies with `noqeri add` and `noqeri.lock`. Source code does not contain versions because dependency resolution and source semantics are separate concerns.

## Current adapters

`http-client`, `supabase`, `firebase`, `convex`, `clerk`, `stripe`, `resend`, `cloudflare`, `vercel`, `neon`, `upstash`, `sentry`, `openai`, `auth0`, `planetscale`, `turso`, `github`, and `tailwind`.

The HTTP-backed packages keep URL construction, API conventions, validation and safe credential placement in Noqeri. A portable host supplies HTTPS transport through a narrow capability boundary. Tailwind uses the official CLI or standalone executable through a process capability because Tailwind is a CSS compiler rather than an HTTP API.

These provider adapters are marked **experimental** until the standard HTTPS/provider host is implemented and exercised on the supported OS matrix. Their source is meaningful and testable, but publishing an adapter is not a claim that every upstream SDK feature has been reproduced.

## Why these are `.nqr`, not `.nqd`

`.nqd` remains the intentionally simple NoqeriDB schema/query format. Reusing `.nqd` as a general SDK/program source extension would create two unrelated meanings for one format and violate Noqeri's simplicity rule. Service libraries therefore use `.nqr`; a future database-specific Supabase/Turso migration or schema file may legitimately use `.sql` or a provider-specific data tool, while embedded NoqeriDB stays `.nqd`.

## Package quality gate

Every newly published provider family contains a manifest, substantive Noqeri source, documentation, a runnable example and a test. Network and secret handling must remain behind the shared provider capability; no package may execute an install script automatically. Packages are GPL-3.0-only like the registry.
