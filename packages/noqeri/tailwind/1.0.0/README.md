# noqeri/tailwind

Noqeri-native Tailwind integration. Tailwind CSS v4 ships its CLI separately as `@tailwindcss/cli`; Tailwind also provides standalone executables for environments that do not want Node/npm. This package calls a host Tailwind executable and keeps Noqeri application code free of JavaScript.

```noqeri
import package "noqeri/tailwind"
let status = tailwindBuild("src/input.css", "public/app.css", true)
```

The host must point `tailwindHostBuild`/`tailwindHostWatch` at an installed official Tailwind CLI or standalone binary.

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
