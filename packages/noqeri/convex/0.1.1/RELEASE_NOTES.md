# convex 0.1.1 · International preview

- New native Noqeri implementation with expanded APIs and concrete bounded algorithms.
- Added positive and negative regression cases and a standalone usage example.
- Explicit errors, destination capacity checks, transport dependency descriptions, and independent MIT notice.
- This is a breaking new release; `0.1.0` and historical `0.4.0` remain unchanged.
- **Experimental** until tested with the relevant compiler/backend and, for hosted adapters, a real authenticated provider session.

## Behavior

Query, mutation and action endpoint paths, HTTP JSON request bodies using path/args/format, function path scanning, status/pagination guard functions and bearer-token forwarding.

## Known limits

Function path/body helper assumes caller supplies a trusted function path and already serialized JSON args. It is not a JSON serializer or real HTTP implementation. Deployment URL must come from trusted configuration; raw user input must never be concatenated into a URL or JSON body.
