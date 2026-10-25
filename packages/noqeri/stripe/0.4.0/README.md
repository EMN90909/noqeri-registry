# noqeri/stripe

Noqeri-native Stripe REST adapter. Stripe secret keys are sent through the provider's HTTP Basic-user authentication mode and must never be embedded in browser/client bundles.

```noqeri
import package "noqeri/stripe"
let customer = stripeGetCustomer(secretKey, "cus_123")
```

All requests are HTTPS-only at the host boundary.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
