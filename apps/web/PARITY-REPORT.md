# Static and HTML parity report

Build output: `apps/web/dist/client`
Workers Builds command: `bun install && bun run build && bun run deploy` from the repository root.

Pages checked: 8
HTML parity failures: 0
Main DOM structure differences: 0
Static files byte-checked: 61
Markdown files byte-checked: 8
Static byte differences: 0
Essay markdown twins included: 4

## Page results

- /: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (132 elements)
- /about: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (87 elements)
- /essays: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (51 elements)
- /404: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (11 elements)
- /essays/dude-where-is-the-roi: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (95 elements)
- /essays/ride-the-floor-up: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (123 elements)
- /essays/my-agents-merged-468-prs: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (226 elements)
- /essays/the-journey-no-longer-matters: identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class sequence (42 elements)

## Main DOM structure

All 8 pages have identical <main> tag and class sequences.

## Static file results

All 69 public static files, including 8 Markdown files, match byte for byte.

## Framework output

TanStack Start adds hydration/runtime scripts to prerendered pages: `/assets/index-CEg9ci0f.js`. They are generated framework output and are excluded from the requested page comparisons.

Result: zero differences in the compared page and static content.
