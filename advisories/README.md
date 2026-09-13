# Noqeri package advisories

This directory is the registry-side input for dependency vulnerability scanning. An empty advisory list means only that no advisories are currently recorded here; it is not a statement that every package is vulnerability-free.

Each advisory should receive a stable identifier and record: affected package, vulnerable version range, patched versions, severity rationale, summary, references, disclosure date, CVE when one exists, and optional workarounds.

`noqeri audit` should consume a signed/release-pinned copy of this data or a registry endpoint that returns the same schema. Unknown/unavailable advisory data must be reported as such rather than silently interpreted as a clean result.

Security reports should follow coordinated disclosure rather than opening a public exploit issue before maintainers have had a reasonable opportunity to triage it.
