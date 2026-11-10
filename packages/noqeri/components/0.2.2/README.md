# Noqeri UI 0.2.2

Experimental native Noqeri component library for server-rendered views. Preserves 0.2.1's 106 components, responsive CSS and five pinned library dependencies. Adds **three accessibility primitives**: `SkipToMain(label, targetHref)`, `LiveStatus(message)`, and `ScreenReaderText(text)`. Contains 109 component definitions total. Includes focus-visible skip-link CSS, a polite ARIA live region and reduced-motion styles.

Native route render and accessibility checks require the compiler and a browser. No Node.js or JavaScript runtime is required for this library; client-side behavior still needs actual native actions / appropriate host support. This release does not replace the existing web framework or implement arbitrary new interactive components.
