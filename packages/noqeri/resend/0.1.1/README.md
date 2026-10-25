# noqeri/resend 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Resend email delivery, domains, broadcasts and templates URL and request helper utilities, including bounded retry and email address shape validation.

The new implementation exports 28 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Requires verified sender/domain and a secure HTTP host. Sending emails is an external side effect. Recipient consent, unsubscribe headers, HTML sanitization and spam controls are caller responsibilities. Endpoint availability varies by API version.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
