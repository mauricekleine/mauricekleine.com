#!/usr/bin/env -S mise exec -- uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "numpy>=2"]
# ///
"""Turn the chosen takes into the page's art, as art/plates.json lists them.

  plate.py export [SLUG ...]   crop and size each plate, then write its depth map
  plate.py masks               draw each button plate's mask from its "mask" polygons
  plate.py cover               cut the canonical button out for the cover, favicon and touch icon
  plate.py og                  set the door pair side by side for the link preview

Plates are cropped inside the painted paper edge to 4:5. Mask polygons and glow
ellipses ([cx, cy, rx] or [cx, cy, rx, ry]) use the exported plate's pixels
(1200 by 1500, origin top left).
"""

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ART = Path(__file__).resolve().parent.parent / "art"
DEPTH = Path(__file__).resolve().parent / "depth.py"


def config():
    return json.loads((ART / "plates.json").read_text())


def export(args):
    cfg = config()
    left, top, right, bottom = cfg["crop"]
    size = tuple(cfg["size"])
    slugs = args.slugs or list(cfg["plates"])
    for slug in slugs:
        for side in ("analog", "button"):
            source = Image.open(ART / cfg["plates"][slug][side]).convert("RGB")
            box = (left, top, source.width - right, source.height - bottom)
            plate = source.crop(box).resize(size, Image.LANCZOS)
            target = ART / f"{slug}-{side}.webp"
            plate.save(target, quality=86, method=6)
            print(target.relative_to(ART.parent))
            depth = ART / f"{slug}-{side}-depth.webp"
            subprocess.run([str(DEPTH), str(target), str(depth), "--width", "600"], check=True)


def masks(_args):
    cfg = config()
    width, height = cfg["size"]
    scale = 4  # draw large, then shrink, for smooth edges
    for slug, plate in cfg["plates"].items():
        quads = plate.get("mask")
        if not quads:
            continue
        canvas = Image.new("L", (width * scale, height * scale), 0)
        draw = ImageDraw.Draw(canvas)
        for quad in quads:
            draw.polygon([(x * scale, y * scale) for x, y in quad], fill=255)
        target = ART / f"{slug}-button-mask.png"
        # a soft edge keeps the seam between print and photograph from showing
        mask = canvas.resize((width, height), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
        mask.save(target, optimize=True)
        print(target.relative_to(ART.parent))


def cover(_args):
    cfg = config()
    source = Image.open(ART / cfg["button"]).convert("RGB")
    lum = np.asarray(source.convert("L"), dtype=np.float32)
    # the steel plate is far brighter than the charcoal backdrop
    ys, xs = np.nonzero(lum > 110)
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    plate = source.crop(box)
    side = max(plate.size)
    plate = plate.resize((side, side), Image.LANCZOS)
    plate.resize((720, 720), Image.LANCZOS).save(ART / "button.webp", quality=88, method=6)
    plate.resize((64, 64), Image.LANCZOS).save(ART / "favicon.png", optimize=True)
    plate.resize((180, 180), Image.LANCZOS).save(ART / "apple-touch-icon.png", optimize=True)
    print("plate box", box, "-> art/button.webp, art/favicon.png, art/apple-touch-icon.png")


def og(_args):
    paper, ink = (239, 229, 207), (34, 28, 22)
    sheet = Image.new("RGB", (1200, 630), paper)
    draw = ImageDraw.Draw(sheet)
    height = 540
    width = height * 4 // 5
    gap = 36
    left = (1200 - 2 * width - gap) // 2
    top = (630 - height) // 2
    for i, side in enumerate(("analog", "button")):
        plate = Image.open(ART / f"door-{side}.webp").convert("RGB").resize((width, height), Image.LANCZOS)
        x = left + i * (width + gap)
        sheet.paste(plate, (x, top))
        draw.rectangle([x - 2, top - 2, x + width + 1, top + height + 1], outline=ink, width=2)
    sheet.save(ART / "og.jpg", quality=86, optimize=True, progressive=True)
    print("art/og.jpg")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)
    e = commands.add_parser("export")
    e.add_argument("slugs", nargs="*")
    commands.add_parser("masks")
    commands.add_parser("cover")
    commands.add_parser("og")
    args = parser.parse_args()
    {"export": export, "masks": masks, "cover": cover, "og": og}[args.command](args)


if __name__ == "__main__":
    main()
