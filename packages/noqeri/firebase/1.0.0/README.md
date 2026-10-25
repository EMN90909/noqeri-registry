# noqeri/firebase

Noqeri-native access to Firebase Authentication REST and Cloud Firestore REST endpoints. Firestore user calls use Firebase ID-token bearer authentication so Firestore Security Rules remain active.

```noqeri
import package "noqeri/firebase"
let url = firebaseDocumentUrl("my-project", "cities/Nairobi")
```

Service-account OAuth tokens are a trusted-server concern and should be obtained by a secure credential provider.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
