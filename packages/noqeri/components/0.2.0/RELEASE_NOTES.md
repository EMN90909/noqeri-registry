# Noqeri UI 0.2.0 (experimental)

- Introduces a native Noqeri build path with zero JavaScript/Node/npm required for the Noqeri-UI project, standalone static site, or native local server-driven actions.
- Reuses 20 existing Noqeri core UI components through `NOQERI_WEB_UI_PATH`, with generated `Core*` aliases, alongside 102 Noqeri-UI components.
- Imports three pinned native Noqeri Registry 0.1.1 modules: dom, html, tailwind. Includes their MIT sources, functional wrappers and native tests.
- Supports compiling an arbitrary user-provided Noqeri native page with `scripts/native.sh build OUT app.noqeri`.
- Verification: https://github.com/EMN90909/Noqeri-UI/actions/runs/42298245898

## Breaking changes from 0.1.0

Removed all JavaScript and TypeScript sources from Noqeri-UI, including the prior Node-based packaging/installer/testing scripts. `import "noqeri/ui" as ui` is the supported native web import, with an assembled library provided by the wrapper. `import "noqeri/components" as ui` is NOT yet natively resolved by the compiler. Existing 0.1.0 remains available.

## Limitations

Experimental Noqeri native web compiler, local-only native action host and browser native controls. No production-grade interactive overlay manager, portal, focus trap, JS-based client state, or direct native web registry import support is claimed.
