#!/usr/bin/env python3
"""One-way migration of obsolete Noqeri extensions and their references.

Run from any directory: python3 scripts/rename_extensions.py
This migration deliberately provides no compatibility with the old names.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = {".nqr": ".noqeri", ".nqo": ".nqri"}
TEXT_SUFFIXES = {".noqeri", ".nqri", ".nqon", ".md", ".json", ".mjs",
                 ".js", ".py", ".cpp", ".h", ".html", ".yml", ".yaml",
                 ".sh", ".txt", ".toml"}
SKIP_DIRS = {".git", "node_modules", ".venv", "__pycache__"}
PATTERN = re.compile(r"\.(?:nqr|nqo)(?![a-zA-Z0-9_])")

def new_extension(match: re.Match[str]) -> str:
    return OLD[match.group()]

def main() -> None:
    changed = 0
    renamed = 0
    files = [p for p in ROOT.rglob("*") if p.is_file()
             and not any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts)]
    for path in sorted(files, key=lambda item: len(item.parts), reverse=True):
        if path.suffix in OLD:
            destination = path.with_suffix(OLD[path.suffix])
            if destination.exists():
                raise RuntimeError(f"Rename collision: {destination}")
            path.rename(destination)
            renamed += 1

    files = [p for p in ROOT.rglob("*") if p.is_file()
             and not any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts)]
    for path in files:
        if path.suffix not in TEXT_SUFFIXES or path == Path(__file__).resolve():
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        updated = PATTERN.sub(new_extension, original)
        updated = re.sub(r"(?m)^(```)nqr\s*$", r"\1noqeri", updated)
        updated = re.sub(r"(?m)^(```)nqo\s*$", r"\1nqri", updated)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Renamed {renamed} files; updated references in {changed} files.")

if __name__ == "__main__":
    main()
