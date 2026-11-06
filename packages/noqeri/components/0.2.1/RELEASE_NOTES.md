# Noqeri UI 0.2.1
Native Noqeri-only UI release with all component source and tooling.
- 106 public components and 20 core Noqeri UI components included at build time.
- Five pinned MIT registry helpers: dom, html, tailwind, router, json (all @0.1.1).
- JavaScript-free color-mode toggle, native mobile navigation, breadcrumbs and pagination.
- Native compiler build validation renders every public UI component.
- Local server tests prove click state mutation, form submission, input escaping and CSRF replay rejection.
- Browser output is HTML/CSS without any JavaScript.
Compatible with Noqeri's current native web bootstrap compiler, using NOQERI_WEB_UI_PATH. Direct registry package imports in the native web DSL are not yet supported. Complex interactive patterns remain experimental.
Noqeri-UI source commit: 71651f0f187a926f49aacca87fdf10b08c3c3f92
UI test: https://github.com/EMN90909/Noqeri-UI/actions/runs/42299674850
Migration from 0.2.0: update to 0.2.1; previously existing component signatures remain, new helpers depend on router and json.
