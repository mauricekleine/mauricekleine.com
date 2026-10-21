#!/usr/bin/env -S mise exec -- uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11"]
# ///
"""Draw the Buttons plates with Nano Banana Pro.

  art.py gen OUT --prompt FILE [--ref IMG ...] [--aspect 4:5] [--takes 2]
      add takes OUT-<n>.png, each with its prompt and references in OUT-<n>.json

OUT is a path prefix such as art/takes/door-analog. The prompt file holds the
whole prompt; lines starting with # are notes and never reach the model.
The key comes from GEMINI_API_KEY, else from 1Password (Soliton Agents).
"""

import argparse
import base64
import json
import mimetypes
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from PIL import Image

MODEL = "gemini-3-pro-image"
KEY_REFERENCE = "op://Soliton Agents/GEMINI_API_KEY/password"


def api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    result = subprocess.run(["op", "read", "-n", KEY_REFERENCE], capture_output=True, text=True)
    if result.returncode != 0 or len(result.stdout.strip()) < 20:
        raise SystemExit(f"no Gemini key: set GEMINI_API_KEY or make {KEY_REFERENCE} readable")
    return result.stdout.strip()


def read_prompt(path):
    lines = Path(path).read_text().splitlines()
    return "\n".join(line for line in lines if not line.startswith("#")).strip()


def request(body, key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    for attempt in range(4):
        req = urllib.request.Request(url, data=body, headers={"x-goog-api-key": key, "Content-Type": "application/json"})
        try:
            return json.load(urllib.request.urlopen(req, timeout=300))
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 503) or attempt == 3:
                raise RuntimeError(f"HTTP {error.code}: {error.read().decode()[:300]}") from None
            time.sleep(20 * (attempt + 1))


def generate(text, refs, aspect, size, path, key):
    parts = [{"inlineData": {"mimeType": mimetypes.guess_type(r)[0] or "image/png",
                             "data": base64.b64encode(Path(r).read_bytes()).decode()}} for r in refs]
    parts.append({"text": text})
    body = json.dumps({"contents": [{"role": "user", "parts": parts}],
                       "generationConfig": {"responseModalities": ["IMAGE"],
                                            "imageConfig": {"aspectRatio": aspect, "imageSize": size}}})
    data = request(body.encode(), key)
    images = [p["inlineData"]["data"] for c in data.get("candidates", [])
              for p in c.get("content", {}).get("parts", []) if "inlineData" in p]
    if not images:
        raise RuntimeError(f"no image ({json.dumps(data)[:300]})")
    # the model answers in PNG or JPEG; keep every take as PNG
    Image.open(BytesIO(base64.b64decode(images[0]))).convert("RGB").save(path)
    record = {"model": MODEL, "aspect": aspect, "size": size, "refs": [str(r) for r in refs], "prompt": text}
    path.with_suffix(".json").write_text(json.dumps(record, indent=2) + "\n")
    return str(path)


def last_take(prefix):
    numbers = [0]
    for path in prefix.parent.glob(f"{prefix.name}-*.png"):
        take = path.stem.removeprefix(f"{prefix.name}-")
        if take.isdigit():
            numbers.append(int(take))
    return max(numbers)


def gen(args):
    prefix = Path(args.out)
    prefix.parent.mkdir(parents=True, exist_ok=True)
    text = read_prompt(args.prompt)
    key = api_key()
    first = last_take(prefix) + 1
    paths = [prefix.parent / f"{prefix.name}-{n}.png" for n in range(first, first + args.takes)]

    def attempt(path):
        try:
            return True, generate(text, args.ref or [], args.aspect, args.size, path, key)
        except Exception as error:  # report every failed take, then fail the run
            return False, f"{path.name}: {error}"

    with ThreadPoolExecutor(6) as pool:
        results = list(pool.map(attempt, paths))
    for ok, line in results:
        print(line if ok else f"failed {line}", file=sys.stdout if ok else sys.stderr)
    if not all(ok for ok, _ in results):
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)
    g = commands.add_parser("gen")
    g.add_argument("out")
    g.add_argument("--prompt", required=True)
    g.add_argument("--ref", action="append")
    g.add_argument("--aspect", default="4:5")
    g.add_argument("--size", default="2K")
    g.add_argument("--takes", type=int, default=2)
    args = parser.parse_args()
    {"gen": gen}[args.command](args)


if __name__ == "__main__":
    main()
