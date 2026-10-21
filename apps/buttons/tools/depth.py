#!/usr/bin/env -S mise exec -- uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "numpy>=2", "onnxruntime>=1.20"]
# ///
"""Estimate a depth map for a plate with Depth Anything V2 Large.

  depth.py IMAGE OUT [--width 640]

Writes OUT as a greyscale image: white is near, black is far. The map is
dilated a little so the parallax shader moves a figure's edge with the figure.
The model (1.3 GB) downloads once to ~/.cache/buttons-depth/.
"""

import argparse
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

CACHE = Path.home() / ".cache" / "buttons-depth"
MODEL_URL = "https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model.onnx"
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
# the short side the model sees, a multiple of 14; larger keeps finer edges
SHORT_SIDE = 770


def model():
    path = CACHE / "model.onnx"
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"downloading {MODEL_URL}")
        urllib.request.urlretrieve(MODEL_URL, path)
    return ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])


def to_multiple(value, base=14):
    return max(base, int(round(value / base)) * base)


def estimate(session, image):
    scale = SHORT_SIDE / min(image.size)
    size = (to_multiple(image.width * scale), to_multiple(image.height * scale))
    pixels = np.asarray(image.convert("RGB").resize(size, Image.BICUBIC), dtype=np.float32) / 255.0
    tensor = ((pixels - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    name = session.get_inputs()[0].name
    (out,) = session.run(None, {name: tensor})
    return np.squeeze(out)  # relative inverse depth: larger is nearer


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image")
    parser.add_argument("out")
    parser.add_argument("--width", type=int, default=640)
    args = parser.parse_args()

    image = Image.open(args.image)
    disparity = estimate(model(), image)
    low, high = np.percentile(disparity, [1, 99.5])
    norm = np.clip((disparity - low) / (high - low), 0, 1)
    height = round(args.width * image.height / image.width)
    depth = Image.fromarray((norm * 255).astype(np.uint8)).resize((args.width, height), Image.BICUBIC)
    # grow near regions by a few pixels, then soften, so silhouettes carry their edge
    depth = depth.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2))
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    depth.save(args.out, quality=90) if args.out.endswith(".webp") else depth.save(args.out)
    print(args.out)


if __name__ == "__main__":
    main()
