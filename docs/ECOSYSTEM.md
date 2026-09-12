# Noqeri ecosystem boundaries

- The compiler defines language semantics, NIR, target abstractions and package resolution contracts.
- `noqeri-registry` owns package metadata and official library source.
- `noqeri-web` owns the public website and human-facing documentation experience.
- Host/environment functionality is accessed through versioned capabilities; the language itself does not assume Linux, Windows, macOS, a filesystem, networking, processes, or a particular object format.
