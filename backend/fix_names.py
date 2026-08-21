"""
AUTO-FIX FILENAMES in ./templates/ folder.

Fixes common mistakes automatically:
  - "business- loan (6).png"   -> "business-loan (6).png"   (extra space after hyphen)
  - "machinery-loan(4).png"    -> "machinery-loan (4).png"  (missing space before bracket)
  - "Business-Loan (3).PNG"    -> "business-loan (3).png"   (wrong case)
  - double spaces, stray spaces before .png/.jpg etc.

Usage:
    python fix_names.py

It will print every rename it makes. If a target name already exists,
it skips that file and warns you (so nothing gets overwritten).
"""
import os
import re

TEMPLATES_DIR = "templates"

# known category prefixes (lowercase, correct hyphenation)
KNOWN_PREFIXES = [
    "business-loan", "working-capital", "machinery-loan", "invoice-finance",
    "trade-finance", "personal-loan", "home-loan", "gold-loan",
    "vechile-loan", "vehicle-loan", "education-loan",
]


def fix_filename(filename):
    name, ext = os.path.splitext(filename)
    ext = ext.lower()

    # normalize spacing/case
    cleaned = name.strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)          # collapse multiple spaces
    cleaned = re.sub(r"-\s+", "-", cleaned)          # remove space right after hyphen
    cleaned = re.sub(r"\s*\(", " (", cleaned)         # ensure exactly one space before (
    cleaned = re.sub(r"\)\s*$", ")", cleaned)         # no trailing space after )
    cleaned = cleaned.strip()

    # make sure known prefix matches exactly (fixes typos like "buisness-loan")
    for prefix in KNOWN_PREFIXES:
        if cleaned.replace(" ", "").startswith(prefix.replace("-", "")):
            rest = cleaned[len(prefix):] if cleaned.startswith(prefix) else ""
            cleaned = prefix + rest
            break

    return cleaned + ext


def main():
    if not os.path.isdir(TEMPLATES_DIR):
        print(f"'{TEMPLATES_DIR}' folder not found.")
        return

    renamed, skipped, unchanged = 0, 0, 0
    for filename in sorted(os.listdir(TEMPLATES_DIR)):
        old_path = os.path.join(TEMPLATES_DIR, filename)
        if not os.path.isfile(old_path):
            continue

        new_filename = fix_filename(filename)
        if new_filename == filename:
            unchanged += 1
            continue

        new_path = os.path.join(TEMPLATES_DIR, new_filename)
        if os.path.exists(new_path):
            print(f"SKIP (target exists): {filename} -> {new_filename}")
            skipped += 1
            continue

        os.rename(old_path, new_path)
        print(f"Renamed: {filename}  ->  {new_filename}")
        renamed += 1

    print(f"\nDone. Renamed: {renamed}, Skipped: {skipped}, Already OK: {unchanged}")


if __name__ == "__main__":
    main()