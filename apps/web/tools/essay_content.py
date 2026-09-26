"""Read and write essay data plus its byte-exact public Markdown twin.

Frontmatter values are JSON-compatible YAML scalars. Keeping each value on one
line lets the authoring tools use Python's standard library alone.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "essays"
PUBLIC = ROOT / "public"
SITE = "https://www.mauricekleine.com"

OPTIONAL_FIELDS = ("inlineLinks",)

FIELDS = (
    "slug", "title", "seoTitle", "summary", "date", "dateDisplay",
    "cover", "coverOriginal", "coverSrcset", "coverSizes", "coverWidth",
    "coverHeight", "coverAlt", "x", "linkedin", "images",
)


def write_content(slug, metadata, markdown):
    """Write data frontmatter followed by unchanged Markdown bytes."""
    if not set(FIELDS).issubset(metadata) or not set(metadata).issubset(set(FIELDS) | set(OPTIONAL_FIELDS)) or metadata["slug"] != slug:
        raise ValueError(f"invalid essay metadata fields: {slug}")
    lines = ["---\n"]
    for key in (*FIELDS, *(key for key in OPTIONAL_FIELDS if key in metadata)):
        lines.append(f"{key}: {json.dumps(metadata[key], ensure_ascii=False)}\n")
    lines.append("---\n")
    path = CONTENT / f"{slug}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes("".join(lines).encode() + markdown)
    return path


def read_content(path):
    data = path.read_bytes()
    if not data.startswith(b"---\n"):
        raise ValueError(f"missing frontmatter: {path}")
    closing = data.find(b"\n---\n", 4)
    if closing < 0:
        raise ValueError(f"missing closing delimiter: {path}")
    metadata = {}
    for line in data[4:closing].decode().splitlines():
        key, value = line.split(": ", 1)
        metadata[key] = json.loads(value)
    if not set(FIELDS).issubset(metadata) or not set(metadata).issubset(set(FIELDS) | set(OPTIONAL_FIELDS)):
        raise ValueError(f"invalid essay metadata fields: {path}")
    return metadata, data[closing + len(b"\n---\n"):]


def essays():
    """Newest essay first, with slug breaking same-date ties."""
    return sorted(
        (read_content(path)[0] for path in CONTENT.glob("*.md")),
        key=lambda essay: (essay["date"], essay["slug"]),
        reverse=True,
    )
