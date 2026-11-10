#!/usr/bin/env python3
"""Static, Node-free package catalog audit; does NOT run the Noqeri compiler."""
import argparse
import json
import pathlib
import re
import sys

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    index = json.loads((root / "registry/index.json").read_text(encoding="utf-8"))
    problems = []
    checked = 0
    exports_total = 0
    hosts = 0
    for package in index["packages"]:
        ns, name = package["namespace"], package["name"]
        versions = {v["version"]: v for v in package["versions"]}
        if "0.4.0" not in versions:
            continue  # separately versioned packages retain their own track
        if "0.5.0" not in versions:
            problems.append(f"{ns}/{name}: missing 0.5.0 index entry")
            continue
        release = versions["0.5.0"]
        if release.get("quality") != "experimental" or release.get("yanked") is not False:
            problems.append(f"{ns}/{name}: incorrect preview release metadata")
        expected = f"packages/{ns}/{name}/0.5.0"
        if release.get("path") != expected:
            problems.append(f"{ns}/{name}: release path mismatch")
        directory = root / expected
        if not directory.is_dir() or directory.is_symlink():
            problems.append(f"{ns}/{name}: unsafe/missing release directory")
            continue
        for rel in ("package.noqeri", "README.md", "tests/regression.noqeri"):
            file = directory / rel
            if not file.is_file() or file.is_symlink() or file.stat().st_size == 0:
                problems.append(f"{ns}/{name}: missing/unsafe/empty {rel}")
        manifest_file = directory / "package.noqeri"
        if not manifest_file.is_file():
            continue
        manifest = manifest_file.read_text(encoding="utf-8")
        if not re.search(r'\bname\s*:\s*"' + re.escape(f"{ns}/{name}") + r'"', manifest):
            problems.append(f"{ns}/{name}: manifest name mismatch")
        if not re.search(r'\bversion\s*:\s*"0\.5\.0"', manifest):
            problems.append(f"{ns}/{name}: manifest version mismatch")
        entry = re.search(r'\bentry\s*:\s*"([^"]+)"', manifest)
        if not entry:
            problems.append(f"{ns}/{name}: no entry")
            continue
        relative = pathlib.PurePosixPath(entry.group(1))
        if relative.is_absolute() or ".." in relative.parts or relative.suffix != ".noqeri":
            problems.append(f"{ns}/{name}: unsafe entry")
            continue
        source = directory / relative
        if not source.is_file() or source.is_symlink():
            problems.append(f"{ns}/{name}: missing entry source")
            continue
        body = source.read_text(encoding="utf-8")
        exports = re.findall(r'\bexport\s+function\s+[A-Za-z_][A-Za-z_0-9]*', body)
        if len(exports) < 5:
            problems.append(f"{ns}/{name}: unexpectedly shallow entry ({len(exports)} exports)")
        exports_total += len(exports)
        hosts += len(re.findall(r'\bextern\s+function\s+', body))
        for path in directory.rglob("*"):
            if path.is_symlink():
                problems.append(f"{ns}/{name}: symlink forbidden: {path.relative_to(directory)}")
        checked += 1
    # Separately versioned packages get a new release too; preserve their tracks.
    special = {"pgas": "0.1.5", "ai-framework": "0.1.5", "components": "0.2.2"}
    for name, version in special.items():
        pkg = next((p for p in index["packages"] if p["namespace"] == "noqeri" and p["name"] == name), None)
        if pkg is None:
            problems.append(f"noqeri/{name}: missing special package")
            continue
        releases = {v["version"]: v for v in pkg["versions"]}
        if version not in releases:
            problems.append(f"noqeri/{name}: missing {version} index entry")
            continue
        release = releases[version]
        expected = f"packages/noqeri/{name}/{version}"
        if release.get("path") != expected or release.get("quality") != "experimental":
            problems.append(f"noqeri/{name}: bad special-track release metadata")
        release_root = root / expected
        manifest_path = release_root / "package.noqeri"
        if not manifest_path.is_file() or manifest_path.is_symlink():
            problems.append(f"noqeri/{name}: missing manifest")
            continue
        manifest = manifest_path.read_text(encoding="utf-8")
        if f'version: "{version}"' not in manifest:
            problems.append(f"noqeri/{name}: manifest version mismatch")
        entry_match = re.search(r'\bentry\s*:\s*"([^"]+)"', manifest)
        if not entry_match:
            problems.append(f"noqeri/{name}: missing entry")
            continue
        entry = pathlib.PurePosixPath(entry_match.group(1))
        if entry.is_absolute() or ".." in entry.parts or not (release_root / entry).is_file():
            problems.append(f"noqeri/{name}: missing/unsafe entry source")
        if not any((release_root / "tests").glob("*.noqeri")):
            problems.append(f"noqeri/{name}: missing regression fixtures")
        checked += 1
    print(json.dumps({"kind": "static-source-inventory-only", "packages_checked": checked,
                      "exports_in_entries": exports_total, "host_extern_declarations": hosts,
                      "problems": problems}, indent=2))
    return 1 if problems or checked != 57 else 0

if __name__ == "__main__":
    sys.exit(main())
