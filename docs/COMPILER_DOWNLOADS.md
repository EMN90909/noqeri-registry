# Noqeri compiler distribution

The download component distributes the **Noqeri compiler**, not individual .nqpkg registry libraries. It has its own immutable, evidence-based artifact catalog.

## Implementation

- The accessible, JavaScript-free [download page](../downloads/index.html).
- GET /downloads and GET /v1/releases, available through the native Noqeri preview and the existing HTTP host.
- [The compiler packaging script](https://github.com/EMN90909/Noqeri/blob/main/scripts/distribution.py) packages real binaries as standalone executables, .gz, .tar, .tar.gz and .zip. A SHA-256, size, source Git commit, target CPU/OS and GPU qualification accompany each file.
- The synchronizer (scripts/sync_downloads.py) fetches a genuine public Noqeri GitHub Release, validates its manifest, downloads the actual assets, checks the SHA-256 **of every byte** and writes an immutable JSON record only after success.
- The installer (scripts/install_noqeri.py) chooses the appropriate architecture, verifies the official HTTPS URL and SHA-256, and safely extracts the compiler without running the downloaded file during installation.

## Target matrix

| Operating system | CPU architecture | Qualification requirement |
|---|---|---|
| Linux | x86-64, ARM64 | Native build and real CLI smoke execution |
| Windows | x86-64, ARM64 | Native build and real CLI smoke execution |
| macOS | Intel x86-64, Apple Silicon ARM64 | Native build and real CLI smoke execution |
| FreeBSD | x86-64, ARM64 | Native VM build and on-target execution |
| OpenBSD | x86-64, ARM64 | Native VM build and on-target execution |
| Android | ARM64, x86-64, ARMv7 | Android NDK CLI (not an APK), cross-build reported build-only until actual device/emulator execution |
| Custom OS | Declared x86-64, ARM64, RISC-V and other supported CPU identifiers | Bring an actual target toolchain, ABI, loader and execution evidence |

A **build recipe is not a published or qualified binary**. As of the initial implementation, Noqeri has no published GitHub Release assets; the download page correctly offers no fake binary URLs.

### GPU capability policy

CPU architecture and GPU architecture are separate dimensions. An AMD, NVIDIA, Intel or Apple GPU-targeted archive is only published when an actual backend/ISA implementation and hardware-driver qualification evidence exist. The manifest records GPU backend, GPU architecture and whether driver testing passed. Without evidence, the artifact is marked generic and may only claim CPU fallback or WGSL shader emission, **not CUDA, ROCm, Vulkan, Metal, Direct3D or WebGPU driver compatibility**. GPU variants receive distinct archive names.

## Publish an actual compiler release

1. Build the source compiler at one exact Git commit, run relevant CLI, shader, source and negative tests on each platform, and package it using the compiler-side Python distribution script. Executed targets require an actual smoke report; cross builds stay build-only.
2. Run the compiler-side distribution combine command with the exact source SHA, version and required target list. It rejects missing targets, damaged archives, invalid formats and mixed revisions, then emits release-manifest.json and checksums.txt.
3. Upload the **real** assets plus their release manifest to the public Noqeri compiler GitHub Release tagged vVERSION. Do not claim Stable unless the executed test gates pass.
4. On the registry, run:

~~~sh
python3 scripts/sync_downloads.py sync --version 0.1.3
python3 scripts/sync_downloads.py build-site
python3 -m unittest discover -s tests -p test_download_catalog.py -v
~~~

The first command authenticates the exact GitHub Release asset path and downloads the actual published bytes before adding distribution/releases/VERSION.json. Previously synchronized version records cannot be overwritten. The second command generates downloads/index.html and downloads/releases.json. This workflow is also available as the manually dispatched **Synchronize published Noqeri compiler downloads** GitHub Action.

The static page may be hosted by Noqeri Web, GitHub Pages or another static web host, and can also be served through the registry at /downloads. DNS, CDN, code-signing keys and deployment authorization are separate release operations.

## Install

Python 3.9+; no pip packages are needed.

~~~sh
python3 scripts/install_noqeri.py
python3 scripts/install_noqeri.py --version 0.1.3 --os linux --cpu arm64 --prefix ~/.local/opt/noqeri
python3 scripts/install_noqeri.py --catalog downloads/releases.json --os freebsd --cpu x86_64
~~~

Installation fails closed if no genuinely published build matches. The installer validates exact GitHub Release URLs and SHA-256 before extraction; ZIP and TAR paths are checked for traversal, symlinks, special files, file counts and size. Installed executables are not launched automatically.

Manual: Linux/macOS/BSD/Android CLI users can extract a .tar.gz; Windows users can use PowerShell Expand-Archive on a .zip. Check sha256sum or Get-FileHash -Algorithm SHA256 first. Android NDK executables require a compatible terminal/API and are **not Android APKs**.

### Custom operating systems

Noqeri currently has a **C++17 Stage-0 compiler**. A custom target needs an actual compatible C++ compiler, standard library, executable loader, ABI and linker. Example from the Noqeri source checkout:

~~~sh
cmake -S . -B build-custom -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_TOOLCHAIN_FILE=/path/to/your-os-toolchain.cmake \
  -DNOQERI_GRAPHICS_PORTABLE_BUILD=ON -DBUILD_TESTING=OFF
cmake --build build-custom --target noqeri
~~~

A cross-compile is build-only until the compiler has run on that CPU/OS. Native Noqeri code generation, Stage-2 self-hosting, graphics drivers and production stability require separate release qualification.
