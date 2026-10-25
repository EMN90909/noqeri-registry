# noqeri/supabase 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Supabase project management and project-scoped REST/Auth/Storage/Functions endpoint builders, with bounded request policies.

The new implementation exports 30 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Management API, PostgREST, Auth and Storage use distinct authentication schemes. The host must handle service-role secrets safely and enforce RLS/tenant boundaries. SQL migrations, realtime subscriptions and signed storage URLs are not implemented.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
