# noqeri/uuid

Portable UUID text validation and version inspection written entirely in Noqeri. It accepts the canonical 8-4-4-4-12 hexadecimal form.

```noqeri
import package "noqeri/uuid"
let ok = uuidTextValid(bytes)
```

<!-- REGISTRY_CAPABILITY_DOC_V2 -->

## API inventory and evidence

Read [API_REFERENCE.md](API_REFERENCE.md) for exported functions, required host bindings and actual capability status. Source uses .noqeri and bytecode uses .nqri. Compiler compatibility and runtime behavior require independent verification.
