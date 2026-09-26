#!/usr/bin/env python3
"""Import an X article as data frontmatter, Markdown, and local images.

Usage: python3 apps/web/tools/import-x-article.py <status-url-or-id> <slug>
       [--summary "one line"] [--linkedin <pulse-url>] [--seo-title "search title"]

Run sync-essays.py after import. The React pages and older/newer navigation read
content directly. The body keeps the author's casing; the display title is
lowercase. Re-importing preserves the existing SEO title unless overridden.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from essay_content import CONTENT, PUBLIC, SITE, read_content, write_content
from optimize_images import COVER_SIZES, cover_variants

def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"user-agent": "mauricekleine.com essay importer"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8")


# draft.js offsets count utf-16 code units. work in that space.
def to_units(s):
    return s.encode("utf-16-le")


def from_units(b):
    return b.decode("utf-16-le", errors="ignore")


def image_dimensions(path):
    data = open(path, "rb").read()
    if data[:2] == b"\xff\xd8":
        sof_markers = {
            0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
            0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
        }
        i = 2
        while i + 4 <= len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            while i < len(data) and data[i] == 0xFF:
                i += 1
            if i >= len(data):
                break
            marker = data[i]
            i += 1
            if marker in (0xD8, 0xD9):
                continue
            if i + 2 > len(data):
                break
            length = int.from_bytes(data[i : i + 2], "big")
            if length < 2 or i + length > len(data):
                break
            if marker in sof_markers and length >= 7:
                height = int.from_bytes(data[i + 3 : i + 5], "big")
                width = int.from_bytes(data[i + 5 : i + 7], "big")
                return width, height
            i += length
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        i = 12
        while i + 8 <= len(data):
            chunk_type = data[i : i + 4]
            size = int.from_bytes(data[i + 4 : i + 8], "little")
            chunk = data[i + 8 : i + 8 + size]
            if chunk_type == b"VP8 " and len(chunk) >= 10 and chunk[3:6] == b"\x9d\x01\x2a":
                width = int.from_bytes(chunk[6:8], "little") & 0x3FFF
                height = int.from_bytes(chunk[8:10], "little") & 0x3FFF
                return width, height
            if chunk_type == b"VP8L" and len(chunk) >= 5:
                bits = int.from_bytes(chunk[1:5], "little")
                return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
            if chunk_type == b"VP8X" and len(chunk) >= 10:
                width = int.from_bytes(chunk[4:7] + b"\x00", "little") + 1
                height = int.from_bytes(chunk[7:10] + b"\x00", "little") + 1
                return width, height
            i += 8 + size + (size & 1)
    raise ValueError(f"unsupported or invalid image: {path}")


def inline_md(block, entities):
    text = block["text"]
    units = to_units(text)
    n = len(units) // 2
    opens, closes = {}, {}
    for r in block["inlineStyleRanges"]:
        if block["type"] == "header-two" and r["style"] == "Bold":
            continue
        tag = {"Bold": "**", "Italic": "_"}.get(r["style"])
        if tag:
            opens.setdefault(r["offset"], []).append((tag, None))
            closes.setdefault(r["offset"] + r["length"], []).append(tag)
    for r in block["entityRanges"]:
        e = entities.get(str(r["key"]))
        if e and e["type"] == "LINK":
            opens.setdefault(r["offset"], []).append(("[", e["data"]["url"]))
            closes.setdefault(r["offset"] + r["length"], []).append("[")
    out, stack, buf = [], [], b""

    def flush():
        nonlocal buf
        if buf:
            out.append(from_units(buf))
            buf = b""

    for i in range(n + 1):
        if i in closes:
            flush()
            for tag in closes[i]:
                while stack:
                    t, href = stack.pop()
                    out.append(f"]({href})" if t == "[" else t)
                    if t == tag:
                        break
        if i in opens:
            flush()
            for tag, href in opens[i]:
                stack.append((tag, href))
                out.append(tag)
        if i < n:
            buf += units[2 * i : 2 * i + 2]
    flush()
    while stack:
        t, href = stack.pop()
        out.append(f"]({href})" if t == "[" else t)
    return "".join(out)


def slugify_check(slug):
    if not re.fullmatch(r"[a-z0-9-]+", slug):
        sys.exit("slug must be lowercase letters, digits and dashes")


def take_option(args, flag):
    if flag not in args:
        return ""
    i = args.index(flag)
    if i + 1 >= len(args):
        sys.exit(f"missing value for {flag}")
    value = args[i + 1]
    del args[i:i + 2]
    return value


def main():
    args = sys.argv[1:]
    seo_title = take_option(args, "--seo-title")
    summary = take_option(args, "--summary")
    linkedin = take_option(args, "--linkedin").split("?")[0]
    if len(args) != 2:
        sys.exit(__doc__)
    ref, slug = args
    slugify_check(slug)
    match = re.search(r"(\d{15,})", ref)
    if not match:
        sys.exit("expected an X status URL or status ID")
    status_id = match.group(1)
    tweet = json.loads(fetch(f"https://api.fxtwitter.com/mauricekleine/status/{status_id}"))["tweet"]
    art = tweet["article"]
    title = art["title"].strip()
    created = datetime.fromtimestamp(tweet["created_timestamp"], tz=timezone.utc)
    iso = created.strftime("%Y-%m-%d")
    human = created.strftime("%-d %b %Y").lower()
    source = f"https://x.com/mauricekleine/status/{status_id}"
    entities = {e["key"]: e["value"] for e in art["content"]["entityMap"]}
    media = {m["media_id"]: m["media_info"] for m in art.get("media_entities") or []}

    image_dir = PUBLIC / "essays" / slug
    image_dir.mkdir(parents=True, exist_ok=True)
    counter = 0
    ffmpeg = shutil.which("ffmpeg")
    images = {}

    def save_image(info, cover=False):
        nonlocal counter
        counter += 1
        url = info["original_img_url"]
        source_ext = os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
        output_ext = ".jpg" if cover and ffmpeg else ".webp" if not cover and ffmpeg else source_ext
        name = f"{counter:02d}{output_ext}"
        path = image_dir / name
        if not path.exists():
            image = fetch(url + ("&" if "?" in url else "?") + "name=orig", binary=True)
            if ffmpeg:
                source_fd, source_path = tempfile.mkstemp(prefix=".source-", suffix=source_ext, dir=image_dir)
                try:
                    with os.fdopen(source_fd, "wb") as output:
                        output.write(image)
                    command = ["ffmpeg", "-y", "-i", source_path, "-vf", "scale='min(1200,iw)':-2"]
                    command += ["-q:v", "3"] if cover else ["-c:v", "libwebp", "-quality", "80"]
                    subprocess.run(command + ["-frames:v", "1", str(path)], check=True)
                finally:
                    os.unlink(source_path)
            else:
                path.write_bytes(image)
                print(f"warning: ffmpeg not found; kept original image at {path}")
        width, height = image_dimensions(path)
        return f"/essays/{slug}/{name}", width, height

    body = []
    cover = cover_original = cover_srcset = cover_sizes = cover_alt = ""
    cover_width, cover_height = 1200, 630
    if art.get("cover_media"):
        info = art["cover_media"]["media_info"]
        cover_alt = info.get("alt_text") or ""
        cover_original, cover_width, cover_height = save_image(info, cover=True)
        cover = cover_original
        variants = cover_variants(PUBLIC / cover_original.lstrip("/"), cover_width)
        if variants:
            candidates = [("/" + path.relative_to(PUBLIC).as_posix(), size) for path, size in variants]
            cover = next((url for url, size in candidates if size >= 800), candidates[-1][0])
            cover_srcset = ", ".join(f"{url} {size}w" for url, size in candidates)
            cover_sizes = COVER_SIZES
        body.append(f"![{cover_alt}]({SITE}{cover_original})")

    blocks = art["content"]["blocks"]
    i = 0
    while i < len(blocks):
        block = blocks[i]
        kind = block["type"]
        if kind in ("unordered-list-item", "ordered-list-item"):
            prefix = "- " if kind == "unordered-list-item" else None
            items = []
            while i < len(blocks) and blocks[i]["type"] == kind:
                items.append(blocks[i])
                i += 1
            body.append("\n".join((prefix or f"{n + 1}. ") + inline_md(item, entities) for n, item in enumerate(items)))
            continue
        if kind == "atomic":
            for reference in block["entityRanges"]:
                entity = entities.get(str(reference["key"]))
                if not entity:
                    continue
                if entity["type"] == "MEDIA":
                    for item in entity["data"]["mediaItems"]:
                        info = media.get(item["mediaId"])
                        if info:
                            alt = info.get("alt_text") or ""
                            src, width, height = save_image(info)
                            images[Path(src).name] = {"width": width, "height": height, "alt": alt}
                            body.append(f"![{alt}]({SITE}{src})")
                elif entity["type"] == "DIVIDER":
                    if not body or not body[-1].startswith("## "):
                        body.append("---")
                elif entity["type"] == "MARKDOWN":
                    body.append(entity["data"]["markdown"].strip("\n"))
                elif entity["type"] == "TWEET":
                    body.append(entity["data"].get("url") or entity["data"].get("tweetUrl") or "")
            i += 1
            continue
        if not block["text"].strip():
            i += 1
            continue
        text = inline_md(block, entities)
        if kind == "header-two":
            body.append("## " + text)
        elif kind == "header-three":
            body.append("### " + text)
        elif kind == "blockquote":
            body.append("> " + text.replace("\n", "\n> "))
        else:
            body.append(text.replace("\n", "  \n"))
        i += 1

    existing = CONTENT / f"{slug}.md"
    previous = read_content(existing)[0] if existing.exists() else None
    title_lower = title.lower()
    metadata = {
        "slug": slug,
        "title": title_lower,
        "seoTitle": f"{seo_title.lower() or title_lower} - maurice kleine" if seo_title or not previous else previous["seoTitle"],
        "summary": summary or (art.get("preview_text") or "").replace("\n", " ").strip()[:155],
        "date": iso,
        "dateDisplay": human,
        "cover": cover,
        "coverOriginal": cover_original,
        "coverSrcset": cover_srcset,
        "coverSizes": cover_sizes,
        "coverWidth": cover_width,
        "coverHeight": cover_height,
        "coverAlt": cover_alt,
        "x": source,
        "linkedin": linkedin,
        "images": images,
    }
    if previous and previous.get("inlineLinks"):
        metadata["inlineLinks"] = previous["inlineLinks"]
    markdown = (
        f"# {title}\n\n{iso} · first posted on [x]({source})"
        + (f" and [linkedin]({linkedin})" if linkedin else "")
        + "\n\n" + "\n\n".join(body) + "\n"
    ).encode()
    write_content(slug, metadata, markdown)
    print(json.dumps({"slug": slug, "title": title, "date": iso, "images": counter}))
    print("run python3 apps/web/tools/sync-essays.py")


if __name__ == "__main__":
    main()
