#!/usr/bin/env python3
"""import an x article into essays/<slug>.html + essays/<slug>.md + essays/<slug>/01.jpg + NN.webp

usage: tools/import-x-article.py <status-url-or-id> <slug> [--summary "one line for the index"] [--linkedin <pulse-url>]

after importing, run tools/link-essays.py to refresh the older/newer footer nav on every essay.

reads the article through api.fxtwitter.com (draft.js blocks + media), keeps
headings, lists, bold, italic, links, blockquotes, dividers, tables, code
blocks and every image. images are optimized with ffmpeg when available: the
cover is JPEG and body images are WebP, all at no more than 1200px wide. if
ffmpeg is unavailable, the original image format is kept with a warning. the
essay body keeps the author's casing; the page chrome is lowercase. no Python
dependencies beyond the standard library.
"""

import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.mauricekleine.com"


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


def inline_html(block, entities):
    # escape text first, then place tags by walking again on the escaped units.
    # simpler: render with placeholder tags, escaping the text characters.
    text = block["text"]
    units = to_units(text)
    n = len(units) // 2
    opens, closes = {}, {}
    for r in block["inlineStyleRanges"]:
        if block["type"] == "header-two" and r["style"] == "Bold":
            continue
        tag = {"Bold": "strong", "Italic": "em"}.get(r["style"])
        if tag:
            opens.setdefault(r["offset"], []).append((tag, None))
            closes.setdefault(r["offset"] + r["length"], []).append(tag)
    for r in block["entityRanges"]:
        e = entities.get(str(r["key"]))
        if e and e["type"] == "LINK":
            opens.setdefault(r["offset"], []).append(("a", e["data"]["url"]))
            closes.setdefault(r["offset"] + r["length"], []).append("a")
    out, stack, buf = [], [], b""

    def flush():
        nonlocal buf
        if buf:
            out.append(html.escape(from_units(buf), quote=False))
            buf = b""

    for i in range(n + 1):
        if i in closes:
            flush()
            for tag in closes[i]:
                while stack:
                    t, _ = stack.pop()
                    out.append(f"</{t}>")
                    if t == tag:
                        break
        if i in opens:
            flush()
            for tag, href in opens[i]:
                stack.append((tag, href))
                out.append(f'<a href="{html.escape(href, quote=True)}">' if tag == "a" else f"<{tag}>")
        if i < n:
            buf += units[2 * i : 2 * i + 2]
    flush()
    while stack:
        t, _ = stack.pop()
        out.append(f"</{t}>")
    s = "".join(out)
    # @handles that are not already inside a link
    s = re.sub(r"(?<![\w/\"])@([A-Za-z0-9_]{1,15})\b", r'<a href="https://x.com/\1">@\1</a>', s)
    return s.replace("\n", "<br />\n")


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


def markdown_entity_html(mdtext):
    mdtext = mdtext.strip("\n")
    fence = re.match(r"^```(\w*)\n(.*?)\n```$", mdtext, re.S)
    if fence:
        return f"<pre><code>{html.escape(fence.group(2))}</code></pre>"
    if mdtext.startswith("|"):
        rows = [[c.strip() for c in line.strip().strip("|").split("|")] for line in mdtext.splitlines() if line.strip()]
        rows = [r for r in rows if not all(re.fullmatch(r"-+", c) for c in r)]
        head, body = rows[0], rows[1:]
        th = "".join(f"<th>{html.escape(c)}</th>" for c in head)
        trs = "".join("<tr>" + "".join(f"<td>{html.escape(c)}</td>" for c in r) + "</tr>" for r in body)
        return f"<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>"
    return f"<p>{html.escape(mdtext)}</p>"


def slugify_check(slug):
    if not re.fullmatch(r"[a-z0-9-]+", slug):
        sys.exit("slug must be lowercase letters, digits and dashes")


def main():
    args = sys.argv[1:]
    summary = ""
    if "--summary" in args:
        i = args.index("--summary")
        summary = args[i + 1]
        del args[i : i + 2]
    linkedin = ""
    if "--linkedin" in args:
        i = args.index("--linkedin")
        linkedin = args[i + 1].split("?")[0]
        del args[i : i + 2]
    if len(args) != 2:
        sys.exit(__doc__)
    ref, slug = args
    slugify_check(slug)
    status_id = re.search(r"(\d{15,})", ref).group(1)
    tweet = json.loads(fetch(f"https://api.fxtwitter.com/mauricekleine/status/{status_id}"))["tweet"]
    art = tweet["article"]
    title = art["title"].strip()
    created = datetime.fromtimestamp(tweet["created_timestamp"], tz=timezone.utc)
    iso = created.strftime("%Y-%m-%d")
    human = created.strftime("%-d %b %Y").lower()
    source = f"https://x.com/mauricekleine/status/{status_id}"
    entities = {e["key"]: e["value"] for e in art["content"]["entityMap"]}
    media = {m["media_id"]: m["media_info"] for m in art.get("media_entities") or []}

    img_dir = os.path.join(ROOT, "essays", slug)
    os.makedirs(img_dir, exist_ok=True)
    counter = [0]
    ffmpeg = shutil.which("ffmpeg")

    def save_image(info, alt, cover=False):
        counter[0] += 1
        url = info["original_img_url"]
        source_ext = os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
        output_ext = ".jpg" if cover and ffmpeg else ".webp" if not cover and ffmpeg else source_ext
        name = f"{counter[0]:02d}{output_ext}"
        path = os.path.join(img_dir, name)
        if not os.path.exists(path):
            image = fetch(url + ("&" if "?" in url else "?") + "name=orig", binary=True)
            if ffmpeg:
                source_fd, source_path = tempfile.mkstemp(prefix=".source-", suffix=source_ext, dir=img_dir)
                try:
                    with os.fdopen(source_fd, "wb") as source:
                        source.write(image)
                    command = [
                        "ffmpeg", "-y", "-i", source_path,
                        "-vf", "scale='min(1200,iw)':-2",
                    ]
                    if cover:
                        command += ["-q:v", "3"]
                    else:
                        command += ["-c:v", "libwebp", "-quality", "80"]
                    command += ["-frames:v", "1", path]
                    subprocess.run(command, check=True)
                finally:
                    os.unlink(source_path)
            else:
                with open(path, "wb") as output:
                    output.write(image)
                print(f"warning: ffmpeg not found; kept original image at {path}")
        w, h = image_dimensions(path)
        return f"/essays/{slug}/{name}", w, h

    def figure(info, alt, cover=False):
        src, w, h = save_image(info, alt, cover=cover)
        dims = f' width="{w}" height="{h}"' if w and h else ""
        attrs = ' fetchpriority="high"' if cover else ' loading="lazy" decoding="async"'
        return (
            f'<figure><img src="{src}" alt="{html.escape(alt, quote=True)}"{dims}{attrs} /></figure>',
            f"![{alt}]({SITE}{src})",
            src,
            (w, h),
        )

    body_html, body_md = [], []
    cover_src = None
    cover_dims = (1200, 630)
    if art.get("cover_media"):
        fh, fm, cover_src, cover_dims = figure(
            art["cover_media"]["media_info"],
            art["cover_media"]["media_info"].get("alt_text") or "",
            cover=True,
        )
        body_html.append(fh.replace("<figure>", '<figure class="cover">'))
        body_md.append(fm)

    blocks = art["content"]["blocks"]
    i = 0
    while i < len(blocks):
        b = blocks[i]
        t = b["type"]
        if t == "unordered-list-item" or t == "ordered-list-item":
            tag = "ul" if t == "unordered-list-item" else "ol"
            items = []
            while i < len(blocks) and blocks[i]["type"] == t:
                items.append(blocks[i])
                i += 1
            body_html.append(f"<{tag}>" + "".join(f"<li>{inline_html(x, entities)}</li>" for x in items) + f"</{tag}>")
            body_md.append("\n".join(("- " if tag == "ul" else f"{k + 1}. ") + inline_md(x, entities) for k, x in enumerate(items)))
            continue
        if t == "atomic":
            for r in b["entityRanges"]:
                e = entities.get(str(r["key"]))
                if not e:
                    continue
                if e["type"] == "MEDIA":
                    for item in e["data"]["mediaItems"]:
                        info = media.get(item["mediaId"])
                        if info:
                            fh, fm, _src, _dims = figure(info, info.get("alt_text") or "")
                            body_html.append(fh)
                            body_md.append(fm)
                elif e["type"] == "DIVIDER":
                    # x inserts a divider under every heading; the heading already separates
                    if body_html and body_html[-1].startswith("<h2>"):
                        continue
                    body_html.append("<hr />")
                    body_md.append("---")
                elif e["type"] == "MARKDOWN":
                    body_html.append(markdown_entity_html(e["data"]["markdown"]))
                    body_md.append(e["data"]["markdown"].strip("\n"))
                elif e["type"] == "TWEET":
                    url = e["data"].get("url") or e["data"].get("tweetUrl") or ""
                    body_html.append(f'<p><a href="{html.escape(url, quote=True)}">{html.escape(url)}</a></p>')
                    body_md.append(url)
            i += 1
            continue
        if not b["text"].strip():
            i += 1
            continue
        if t == "header-two":
            body_html.append(f"<h2>{inline_html(b, entities)}</h2>")
            body_md.append(f"## {inline_md(b, entities)}")
        elif t == "header-three":
            body_html.append(f"<h3>{inline_html(b, entities)}</h3>")
            body_md.append(f"### {inline_md(b, entities)}")
        elif t == "blockquote":
            body_html.append(f"<blockquote><p>{inline_html(b, entities)}</p></blockquote>")
            body_md.append("> " + inline_md(b, entities).replace("\n", "\n> "))
        else:
            body_html.append(f"<p>{inline_html(b, entities)}</p>")
            body_md.append(inline_md(b, entities).replace("\n", "  \n"))
        i += 1

    title_lc = title.lower()
    desc = summary or (art.get("preview_text") or "").replace("\n", " ").strip()[:155]
    fonts = """    <!-- Fonts: Panchang + Supreme via Fontshare, Fragment Mono via Google -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://api.fontshare.com" />
    <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://api.fontshare.com/v2/css?f[]=panchang@400,600,800&f[]=supreme@400,500&display=swap"
      rel="stylesheet"
    />
"""
    cover_info = (art.get("cover_media") or {}).get("media_info", {})
    og_image = f"{SITE}{cover_src}" if cover_src else f"{SITE}/og.png"
    og_width, og_height = (cover_dims if cover_src else (1200, 630))
    og_alt = cover_info.get("alt_text") or f"cover image for {title_lc}"
    article = "\n".join("          " + line for line in body_html)
    page = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{html.escape(title_lc)} - Maurice Kleine</title>
    <meta name="description" content="{html.escape(desc, quote=True)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="{SITE}/essays/{slug}" />
    <meta name="theme-color" content="#11131f" />
    <link rel="alternate" type="text/markdown" href="/essays/{slug}.md" title="markdown version" />
    <link rel="author" href="/humans.txt" />
    <meta property="article:published_time" content="{iso}" />
    <meta property="article:author" content="{SITE}/about" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Maurice Kleine" />
    <meta property="og:title" content="{html.escape(title_lc, quote=True)}" />
    <meta property="og:description" content="{html.escape(desc, quote=True)}" />
    <meta property="og:image" content="{og_image}" />
    <meta property="og:image:width" content="{og_width}" />
    <meta property="og:image:height" content="{og_height}" />
    <meta property="og:image:alt" content="{html.escape(og_alt, quote=True)}" />
    <meta property="og:url" content="{SITE}/essays/{slug}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{html.escape(title_lc, quote=True)}" />
    <meta name="twitter:description" content="{html.escape(desc, quote=True)}" />
    <meta name="twitter:image" content="{og_image}" />
    <meta name="twitter:image:alt" content="{html.escape(og_alt, quote=True)}" />

    <!-- Icons -->
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/maurice.png" />

{fonts}    <link rel="stylesheet" href="/style.css" />

    <script type="application/ld+json">
      {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": {json.dumps(title)},
        "description": {json.dumps(desc)},
        "datePublished": "{iso}",
        "dateModified": "{iso}",
        "url": "{SITE}/essays/{slug}",
        "mainEntityOfPage": "{SITE}/essays/{slug}",
        "image": "{og_image}",
        "author": {{ "@type": "Person", "@id": "{SITE}/#maurice", "name": "Maurice Kleine", "url": "{SITE}/" }},
        "sameAs": {json.dumps([source, linkedin] if linkedin else source)}
      }}
    </script>
  </head>
  <body>
    <canvas id="nebula" aria-hidden="true"></canvas>
    <canvas id="stars" aria-hidden="true"></canvas>

    <main>
      <header class="hero page-hero">
        <p class="hero-meta"><a href="/essays">← essays</a></p>
        <h1 class="essay-title">{html.escape(title_lc)}</h1>
        <p class="essay-meta">
          by <a href="/about">maurice kleine</a> · <time datetime="{iso}">{human}</time> ·
          first posted on <a href="{source}">x</a>{f' and <a href="{linkedin}">linkedin</a>' if linkedin else ''}
        </p>
      </header>

      <article class="essay">
{article}
      </article>

      <footer>
        <!-- essay-nav: generated by tools/link-essays.py -->
        <!-- /essay-nav -->
        <p><a href="/essays">← all essays</a></p>
      </footer>
    </main>

    <script src="/texture.js"></script>
    <script src="/stars.js"></script>
    <script src="/webmcp.js"></script>
    <script async src="https://api.mauricekleine.com/latest.js"></script>
  </body>
</html>
"""
    open(os.path.join(ROOT, "essays", f"{slug}.html"), "w").write(page)
    md = f"# {title}\n\n{iso} · first posted on [x]({source})" + (f" and [linkedin]({linkedin})" if linkedin else "") + "\n\n" + "\n\n".join(body_md) + "\n"
    open(os.path.join(ROOT, "essays", f"{slug}.md"), "w").write(md)
    print(json.dumps({"slug": slug, "title": title, "date": iso, "human": human, "images": counter[0], "summary": desc}))
    print("reminder: add the new entry's cover <img> with width/height to essays.html")


if __name__ == "__main__":
    main()
