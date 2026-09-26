#!/usr/bin/env python3
"""Publish Markdown twins and essay discovery files from content frontmatter."""

import html
import re

from essay_content import CONTENT, PUBLIC, SITE, read_content


def main():
    records = sorted((read_content(path) for path in CONTENT.glob("*.md")), key=lambda pair: pair[0]["order"])
    essays = [metadata for metadata, _ in records]
    for metadata, markdown in records:
        target = PUBLIC / "essays" / f'{metadata["slug"]}.md'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(markdown)

    intro = (
        "# essays\n\n"
        "longer thoughts, first posted on x and linkedin. mirrored on "
        "[mauricekleine.com/essays](https://www.mauricekleine.com/essays) so they have a home.\n\n"
    )
    rows = [
        f'- [{essay["title"]}]({SITE}/essays/{essay["slug"]}.md) ({essay["date"]}) - {essay["summary"]}'
        for essay in essays
    ]
    (PUBLIC / "essays.md").write_text(intro + "\n".join(rows) + "\n")

    home_path = PUBLIC / "index.md"
    home = home_path.read_text()
    home, count = re.subn(
        r"(?<=## essays\n\n).*?(?=\n\n\[all essays\])",
        "\n".join(rows), home, flags=re.S,
    )
    if count != 1:
        raise ValueError("missing home Markdown essay list")
    home_path.write_text(home)

    llms_path = PUBLIC / "llms.txt"
    llms = llms_path.read_text()
    llms_rows = [
        f'- [{essay["title"]}]({SITE}/essays/{essay["slug"]}.md): {essay["summary"]}'
        for essay in essays
    ]
    llms = re.sub(r"(?<=## essays\n\n).*?(?=\n\n## side quests)", "\n".join(llms_rows), llms, flags=re.S)
    llms_path.write_text(llms)

    feed_path = PUBLIC / "feed.xml"
    feed = feed_path.read_text()
    feed = re.sub(r"<updated>[^<]+</updated>", f'<updated>{essays[0]["date"]}T00:00:00Z</updated>', feed, count=1)
    entries = []
    for essay in essays:
        url = f'{SITE}/essays/{essay["slug"]}'
        entries.append(
            "  <entry>\n"
            f'    <title>{html.escape(essay["title"], quote=False)}</title>\n'
            f'    <link href="{url}" />\n'
            f'    <id>{url}</id>\n'
            f'    <updated>{essay["date"]}T00:00:00Z</updated>\n'
            f'    <summary>{html.escape(essay["summary"], quote=False)}</summary>\n'
            "  </entry>"
        )
    feed = re.sub(r"  <entry>.*?  </entry>(?:\n  <entry>.*?  </entry>)*", "\n".join(entries), feed, flags=re.S)
    feed_path.write_text(feed)

    sitemap_path = PUBLIC / "sitemap.xml"
    sitemap = sitemap_path.read_text()
    urls = []
    for essay in essays:
        urls.append(
            "  <url>\n"
            f'    <loc>{SITE}/essays/{essay["slug"]}</loc>\n'
            f'    <lastmod>{essay["date"]}</lastmod>\n'
            "  </url>"
        )
    sitemap = re.sub(
        r"  <url>\n    <loc>https://www\.mauricekleine\.com/essays/[^<]+</loc>.*?  </url>(?:\n  <url>\n    <loc>https://www\.mauricekleine\.com/essays/[^<]+</loc>.*?  </url>)*",
        "\n".join(urls), sitemap, flags=re.S,
    )
    sitemap_path.write_text(sitemap)
    print(f"synced {len(essays)} essay Markdown twins, index.md, essays.md, llms.txt, feed.xml, sitemap.xml")


if __name__ == "__main__":
    main()
