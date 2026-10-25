# noqeri/stripe 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Stripe API v1 path builders and safe request policies for payment intents, checkout sessions, customers, refunds, invoices and subscriptions.

The new implementation exports 32 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Stripe expects application/x-www-form-urlencoded request bodies on many endpoints, NOT arbitrary JSON. The transport adapter does not generate or sign webhooks, perform PCI duties, manage idempotency headers or implement SCA flows. Monetary units and currencies must be checked against Stripe documentation.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
