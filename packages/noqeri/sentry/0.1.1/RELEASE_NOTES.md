# 0.1.1 release: noqeri/sentry

Expanded Noqeri APIs, regression tests and examples, new MIT-licensed original source, distinct from historical versions.

REST management API is NOT the same as Sentry's envelope ingestion endpoint. This package does not sign sessions, build a complete Sentry envelope, capture crash stacks, or transmit events without a configured secure host.
