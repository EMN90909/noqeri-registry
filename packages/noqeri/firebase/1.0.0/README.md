# noqeri/firebase

Noqeri-native access to Firebase Authentication REST and Cloud Firestore REST endpoints. Firestore user calls use Firebase ID-token bearer authentication so Firestore Security Rules remain active.

```nqr
import package "noqeri/firebase"
let url = firebaseDocumentUrl("my-project", "cities/Nairobi")
```

Service-account OAuth tokens are a trusted-server concern and should be obtained by a secure credential provider.
