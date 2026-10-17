# noqeri/stripe

Noqeri-native Stripe REST adapter. Stripe secret keys are sent through the provider's HTTP Basic-user authentication mode and must never be embedded in browser/client bundles.

```nqr
import package "noqeri/stripe"
let customer = stripeGetCustomer(secretKey, "cus_123")
```

All requests are HTTPS-only at the host boundary.
