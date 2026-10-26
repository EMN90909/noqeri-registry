# noqeri/ai-framework 0.1.4

**Experimental · Apache-2.0 · Noqeri 0.1.4 source library**

Noqeri remains general-purpose: this optional package supplies pure .noqeri
learning, scalar gradient, pair-counting and bounded agent-policy primitives.
Install from the [Noqeri Registry](https://github.com/EMN90909/noqeri-registry)
using its versioned package API. Entry point: `src/framework.noqeri`.

The compiled native tensor and transformer backend is separately delivered in
[Noqeri](https://github.com/EMN90909/Noqeri) as
`include/noqeri/ai_framework.hpp` + `libnoqeri_ai`. The current Stage-0 package
loader DOES NOT implicitly bind or compile native C++ from a registry package.
Do not claim this package alone provides GPU training or direct tensor FFI.

## Quick start

```noqeri
import "../src/framework.noqeri"
let w = ai_framework_sgd_weight(0.0,0.0,2.0,4.0,0.1)
print(w)
```

## Verification

```sh
noqeri check tests/regression.noqeri
noqeri run tests/regression.noqeri
```

The native runtime has separate CTest gradient finite-difference and
transformer save/load tests in the Noqeri language repository. Package
status is **experimental / test-contract**, not independently verified on
all target platforms. No ambient network, shell, filesystem or tool privilege
is granted by importing this package.
