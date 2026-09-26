"""Read and write essay content without a Python YAML dependency.

The frontmatter uses JSON-compatible YAML scalars. The Markdown after its
closing delimiter is copied verbatim to the public .md URL.
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "essays"
PUBLIC = ROOT / "public"
SITE = "https://www.mauricekleine.com"


def extract(page, pattern):
    match = re.search(pattern, page, re.S)
    if not match:
        raise ValueError(f"missing essay markup: {pattern}")
    return html.unescape(match.group(1))


def image_attribute(tag, name):
    match = re.search(r"\b" + name + r'="([^"]*)"', tag)
    return html.unescape(match.group(1)) if match else ""


def metadata_from_html(slug, page, order=0, older="", newer=""):
    """Capture both editable fields and exact legacy HTML snapshots."""
    cover_tag = extract(page, r'<figure class="cover">(<img .*?/>)</figure>')
    json_ld = json.loads(extract(page, r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>'))
    meta_line = extract(page, r'<p class="essay-meta">(.*?)</p>')
    source_links = {label: url for url, label in re.findall(r'<a href="([^"]+)">(x|linkedin)</a>', meta_line)}
    return {
        "slug": slug,
        "title": extract(page, r'<h1 class="essay-title">(.*?)</h1>'),
        "seoTitle": extract(page, r'<title>(.*?)</title>'),
        "summary": extract(page, r'<meta name="description" content="(.*?)" />'),
        "date": extract(page, r'<time datetime="(.*?)">'),
        "dateDisplay": extract(page, r'<time datetime="[^"]+">(.*?)</time>'),
        "cover": image_attribute(cover_tag, "src"),
        "coverOriginal": json_ld["image"].removeprefix(SITE),
        "coverSrcset": image_attribute(cover_tag, "srcset"),
        "coverSizes": image_attribute(cover_tag, "sizes"),
        "coverWidth": int(image_attribute(cover_tag, "width")),
        "coverHeight": int(image_attribute(cover_tag, "height")),
        "coverAlt": image_attribute(cover_tag, "alt"),
        "x": source_links.get("x", ""),
        "linkedin": source_links.get("linkedin", ""),
        "ogImage": json_ld["image"],
        "ogImageWidth": int(extract(page, r'<meta property="og:image:width" content="(.*?)" />')),
        "ogImageHeight": int(extract(page, r'<meta property="og:image:height" content="(.*?)" />')),
        "ogImageAlt": extract(page, r'<meta property="og:image:alt" content="(.*?)" />'),
        "jsonLd": json_ld,
        "order": order,
        "older": older,
        "newer": newer,
        "headHtml": re.search(r"<head>(.*?)</head>", page, re.S).group(1),
        "beforeArticleHtml": re.search(r'<body>(.*?)<article class="essay">', page, re.S).group(1),
        "afterArticleHtml": re.search(r"</article>(.*?)</body>", page, re.S).group(1),
        "articleHtml": re.search(r'<article class="essay">\n(.*?)\n      </article>', page, re.S).group(1),
    }


def write_content(slug, metadata, markdown):
    """Write frontmatter and the exact public Markdown bytes."""
    article = metadata["articleHtml"]
    lines = ["---\n"]
    for key, value in metadata.items():
        if key != "articleHtml":
            lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}\n")
    # Explicit indentation keeps unindented HTML continuation lines in the block.
    lines.append("articleHtml: |2-\n")
    lines.extend("  " + line + "\n" for line in article.split("\n"))
    lines.append("---\n")
    path = CONTENT / f"{slug}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes("".join(lines).encode() + markdown)
    return path


def read_content(path):
    data = path.read_bytes()
    first = data.find(b"---\n")
    if first != 0:
        raise ValueError(f"missing frontmatter: {path}")
    closing = data.find(b"\n---\n", 4)
    if closing < 0:
        raise ValueError(f"missing closing delimiter: {path}")
    front = data[4:closing].decode()
    markdown = data[closing + len(b"\n---\n"):]
    metadata = {}
    article_lines = []
    in_article = False
    for line in front.splitlines():
        if in_article:
            if not line.startswith("  "):
                raise ValueError(f"invalid articleHtml line: {path}")
            article_lines.append(line[2:])
        elif line == "articleHtml: |2-":
            in_article = True
        else:
            key, value = line.split(": ", 1)
            metadata[key] = json.loads(value)
    metadata["articleHtml"] = "\n".join(article_lines)
    return metadata, markdown


def essays():
    return sorted((read_content(path)[0] for path in CONTENT.glob("*.md")), key=lambda essay: essay["order"])
