# Canonical 0.1.0 migration (experimental)

Copied 54 active 0.4.0 package trees to canonical 0.1.0 source versions, preserving previous release contents and hashes. PGAS 0.1.0 already existed. Previous non-yanked releases become yanked in the bootstrap index, which can break existing exact pins. Existing deployed NoeSQL metadata is NOT changed by editing the bootstrap index; staging import and migration are required.

No .nqo files exist in this repository; canonical compiler output is .nqri. Old .nqr files remain under immutable historical versions so checksums and reproduction are not broken. All new source files use .noqeri names; source-content import references require subsequent migration checks.

The JavaScript Node transport is still a compatibility dependency. Removing it before a verified Noqeri native HTTP/TLS host implementation and NoeSQL FFI would leave the registry unable to serve requests. Do not claim production native Noqeri parity until such integration is built and tested. The package baseline is experimental.
