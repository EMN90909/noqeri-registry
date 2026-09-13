# Noqeri Registry

The official source registry for Noqeri packages. Registry runtime logic and package implementations are written in Noqeri. Operating-system I/O is reached only through explicit Noqeri ABI `extern` capabilities, so package logic is not tied to Go, C, C++, Windows, Linux, or macOS APIs.

## Run

```sh
noqeri run Programs/registry.nqr
```

The host ABI supplies package-file access and HTTP serving. Noqeri-owned code validates package names, versions, ports and package-domain rules.

## Package quality rule

A published package must contain useful exported behavior. Manifest-only packages and placeholder sources are not accepted. Host-backed packages keep validation, framing, status handling and protocol rules in Noqeri and restrict `extern` functions to the actual host capability boundary.

## License

Everything in this repository, including every package, is licensed under **GPL-3.0-only**. Package source files carry SPDX identifiers and the repository `LICENSE` contains the GPL-3.0-only notice and canonical FSF license reference.

## Local testing

GitHub Actions is intentionally not required. Run checks on your own machine with the installed Noqeri stage-0/stage-1 compiler:

```sh
noqeri check Programs/registry.nqr
noqeri check tests/registry_contracts.nqr
```
