# noqeri/stripe 0.1.1 API Reference

## 32 exported functions

- stripeAmountValid
- stripeBalanceTransactionsUrl
- stripeBodyValid
- stripeCheckoutSessionsUrl
- stripeCredentialValid
- stripeCustomersUrl
- stripeDelayMillis
- stripeDelete
- stripeFormEncodedByte
- stripeGet
- stripeIdempotencyKeySizeValid
- stripeIdentifierChar
- stripeIdentifierValid
- stripeInvoicesUrl
- stripeMethodAllowed
- stripePageSizeValid
- stripePatch
- stripePaymentIntentUrl
- stripePaymentIntentsUrl
- stripePaymentMethodsUrl
- stripePost
- stripePricesUrl
- stripeProductsUrl
- stripeRateLimited
- stripeRefundsUrl
- stripeRequest
- stripeRetryable
- stripeRoot
- stripeSetupIntentsUrl
- stripeStatus
- stripeSubscriptionsUrl
- stripeSuccess

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

Stripe API v1 path builders and safe request policies for payment intents, checkout sessions, customers, refunds, invoices and subscriptions.

## Limitations

Stripe expects application/x-www-form-urlencoded request bodies on many endpoints, NOT arbitrary JSON. The transport adapter does not generate or sign webhooks, perform PCI duties, manage idempotency headers or implement SCA flows. Monetary units and currencies must be checked against Stripe documentation.
