# 0.1.1 release: noqeri/stripe

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

Stripe expects application/x-www-form-urlencoded request bodies on many endpoints, NOT arbitrary JSON. The transport adapter does not generate or sign webhooks, perform PCI duties, manage idempotency headers or implement SCA flows. Monetary units and currencies must be checked against Stripe documentation.
