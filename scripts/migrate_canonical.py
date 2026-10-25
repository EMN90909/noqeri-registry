#!/usr/bin/env python3
"""Create canonical Noqeri 0.1.0 release trees without rewriting historical releases.

This is a one-off repository maintenance tool, not part of the registry runtime.
Use --write to create releases and update the index; --check to validate them.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGES = ROOT / "packages" / "noqeri"
INDEX = ROOT / "registry" / "index.json"
SOURCE_VERSION = "0.4.0"
TARGET_VERSION = "0.1.0"
EXTENSIONS = {".noqeri": ".noqeri", ".nqri": ".nqri"}
TEXT_EXTENSIONS = {".noqeri", ".nqri", ".md", ".txt", ".json", ".nqon"}
ENTRY = re.compile(r'\bentry\s*:\s*"([^"]+)"')
VERSION = re.compile(r'\bversion\s*:\s*"0\.4\.0"')


def packages_to_migrate(index: dict) -> list[dict]:
    return [
        package for package in index["packages"]
        if any(item["version"] == SOURCE_VERSION for item in package["versions"])
        and package["name"] != "pgas"
    ]


def migrate_dir(source: Path, destination: Path) -> None:
    if destination.exists():
        raise RuntimeError(f"Destination already exists; refusing to overwrite: {destination}")
    shutil.copytree(source, destination, symlinks=False)
    # Rename the deepest paths first so traversal never loses an entry.
    for path in sorted(destination.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if path.is_file() and path.suffix in EXTENSIONS:
            path.rename(path.with_suffix(EXTENSIONS[path.suffix]))
    for path in sorted(destination.rglob("*")):
        if not path.is_file() or path.suffix not in TEXT_EXTENSIONS:
            continue
        content = path.read_text(encoding="utf-8")
        content = content.replace(".noqeri", ".noqeri").replace(".nqri", ".nqri")
        if path.name == "package.noqeri":
            content, count = VERSION.subn('version: "0.1.0"', content)
            if count != 1:
                raise RuntimeError(f"Expected one version field in {path}, found {count}")
        path.write_text(content, encoding="utf-8")
    (destination / "RELEASE_NOTES.md").write_text(
        "# 0.1.0: canonical Noqeri-source release\n\n"
        "This experimental release is derived from the 0.4.0 implementation. "
        "Source, test, example and manifest filenames now use .noqeri, and "
        "compiled bytecode filenames use .nqri. Relative references have been "
        "updated. Historic versions remain untouched.\n\n"
        "This migration is a source-format change, not a verified native "
        "compiler/runtime or provider integration qualification.\n",
        encoding="utf-8",
    )


def verify_release(package: dict) -> None:
    name = package["name"]
    directory = PACKAGES / name / TARGET_VERSION
    if not directory.is_dir():
        raise RuntimeError(f"Missing 0.1.0 release for {name}")
    manifest = directory / "package.noqeri"
    if not manifest.is_file():
        raise RuntimeError(f"Missing canonical manifest for {name}")
    text = manifest.read_text(encoding="utf-8")
    if not re.search(r'\bversion\s*:\s*"0\.1\.0"', text):
        raise RuntimeError(f"Wrong manifest version for {name}")
    if not re.search(r'\bname\s*:\s*"noqeri/' + re.escape(name) + r'"', text):
        raise RuntimeError(f"Wrong package coordinate for {name}")
    entry = ENTRY.search(text)
    if not entry or not entry.group(1).endswith(".noqeri") or not (directory / entry.group(1)).is_file():
        raise RuntimeError(f"Invalid canonical entry for {name}")
    for path in directory.rglob("*"):
        if path.is_file() and path.suffix in EXTENSIONS:
            raise RuntimeError(f"Legacy file remains in {name}: {path}")
        if path.is_file() and path.suffix in TEXT_EXTENSIONS and path.name != "RELEASE_NOTES.md":
            text = path.read_text(encoding="utf-8")
            if ".noqeri" in text or ".nqri" in text:
                raise RuntimeError(f"Legacy reference remains in {path}")
            if path.suffix == ".noqeri":
                # Validate explicit relative imports before compiler testing.
                for ref in re.findall(r'\bimport\s*"([^"]+)"', text):
                    if ref.startswith(".") and not (path.parent / ref).is_file():
                        raise RuntimeError(f"Missing relative import {ref} from {path}")


def main() -> None:
    cli = argparse.ArgumentParser()
    group = cli.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = cli.parse_args()

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    packages = packages_to_migrate(index)
    if len(packages) != 54:
        raise RuntimeError(f"Expected 54 legacy library coordinates, found {len(packages)}")
    if args.write:
        for package in packages:
            name = package["name"]
            source = PACKAGES / name / SOURCE_VERSION
            destination = PACKAGES / name / TARGET_VERSION
            if not source.is_dir():
                raise RuntimeError(f"Missing source release: {source}")
            if not destination.exists():
                migrate_dir(source, destination)
            if not any(item["version"] == TARGET_VERSION for item in package["versions"]):
                package["versions"].append({
                    "version": TARGET_VERSION,
                    "path": f"packages/noqeri/{name}/{TARGET_VERSION}",
                    "yanked": False,
                    "experimental": True,
                    "quality": "experimental",
                    "evidence": "test-contract",
                    "migrationFrom": SOURCE_VERSION,
                })
        INDEX.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    for package in packages_to_migrate(index):
        versions = [v for v in package["versions"] if v["version"] == TARGET_VERSION]
        if len(versions) != 1 or versions[0].get("yanked") is not False:
            raise RuntimeError(f"0.1.0 catalog entry missing or invalid for {package['name']}")
        verify_release(package)
    print(f"Canonical 0.1.0 package releases verified: {len(packages)}")


if __name__ == "__main__":
    main()
