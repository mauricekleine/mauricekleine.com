# Static and HTML parity report

Build output: `apps/web/dist/client`
Workers Builds command: `bun install && bun run build && bun run deploy` from the repository root.

Pages checked: 8
HTML parity failures: 0
Static files byte-checked: 61
Markdown files byte-checked: 8
Static byte differences: 0
Essay markdown twins included: 4

## Page results

- /: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /about: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /essays: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /404: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /essays/dude-where-is-the-roi: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /essays/my-agents-merged-468-prs: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /essays/ride-the-floor-up: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD
- /essays/the-journey-no-longer-matters: identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD

## Static file results

All 69 public static files, including 8 Markdown files, match byte for byte.

## Framework output

TanStack Start adds hydration/runtime scripts to prerendered pages: `/assets/index-v40m_1Za.js`. They are generated framework output and are excluded from the requested page comparisons.

Result: zero differences in the compared page and static content.
