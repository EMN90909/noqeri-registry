# Offline transparency seed

This directory is the repository-backed seed format for the future `sum.noqeri.dev` checksum transparency service.

Each package release should eventually contribute an append-only record containing:

- package namespace/name
- exact version
- canonical archive SHA-256
- publication timestamp
- publisher key identifier when signing is enabled
- yank/security state transitions as separate append-only events

Historical checksum records must not be edited in place. Corrections are represented by additional signed events so auditors can reconstruct the complete history.
