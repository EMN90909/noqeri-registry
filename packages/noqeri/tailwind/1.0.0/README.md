# noqeri/tailwind

Noqeri-native Tailwind integration. Tailwind CSS v4 ships its CLI separately as `@tailwindcss/cli`; Tailwind also provides standalone executables for environments that do not want Node/npm. This package calls a host Tailwind executable and keeps Noqeri application code free of JavaScript.

```nqr
import package "noqeri/tailwind"
let status = tailwindBuild("src/input.css", "public/app.css", true)
```

The host must point `tailwindHostBuild`/`tailwindHostWatch` at an installed official Tailwind CLI or standalone binary.
