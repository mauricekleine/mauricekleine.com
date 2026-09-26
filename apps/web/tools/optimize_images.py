#!/usr/bin/env python3
"""Generate responsive WebP copies with the system cwebp tool; no site build step.

Run from the repo root after adding covers: python3 apps/web/tools/optimize_images.py
Original JPEGs stay available for social previews, schema and Markdown.
Existing derivatives are never overwritten: use a new basename for changed art.
"""

from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent / "public"
COVER_WIDTHS = (480, 800, 1200)
# main is 40rem including padding: 1.25rem on mobile, 1.5rem otherwise.
COVER_SIZES = "(max-width: 600px) calc(100vw - 2.5rem), (max-width: 640px) calc(100vw - 3rem), 37rem"


def webp(source, output, width):
    if not output.exists():
        subprocess.run([
            "cwebp", "-quiet", "-q", "82", "-m", "6", "-resize", str(width), "0",
            str(source), "-o", str(output),
        ], check=True)


def cover_variants(source, width=1200):
    if not shutil.which("cwebp"):
        print("warning: cwebp not found; keeping the original cover")
        return []
    variants = []
    for size in sorted({min(size, width) for size in COVER_WIDTHS}):
        output = source.with_name(f"{source.stem}-{size}.webp")
        webp(source, output, size)
        variants.append((output, size))
    return variants


if __name__ == "__main__":
    if not shutil.which("cwebp"):
        raise SystemExit("cwebp is required (system WebP tools); no files changed")
    for size in (96, 192, 288):
        webp(ROOT / "maurice.png", ROOT / f"maurice-{size}.webp", size)
    for source in sorted((ROOT / "essays").glob("*/01.jpg")):
        cover_variants(source)
