# noqeri/clerk

Noqeri-native backend wrapper for Clerk's REST Backend API at `https://api.clerk.com/v1`. Backend calls use bearer secret-key authentication and must stay in trusted server code.

```nqr
import package "noqeri/clerk"
let user = clerkGetUser(secretKey, "user_123")
```
