# mauricekleine.com web app

`apps/web/` is the live TanStack Start app. `apps/site/` is the unchanged static parity reference. Read `apps/site/PRODUCT.md` and `apps/site/DESIGN.md` before changing product or design.

## Commands

Run from the repository root:

```sh
bun install
bun run dev
bun run build
bun run test
node apps/web/tools/parity.mjs
bunx wrangler deploy --dry-run
bun run deploy
```

Workers Builds uses `bun install && bun run build` as its build command and `bun run deploy` as its deploy command. If only one command field is available, use `bun install && bun run build && bun run deploy`. The root build writes `.wrangler/deploy/config.json` so root Wrangler commands use the Vite plugin's generated Worker config. The Worker keeps the name `mauricekleine-com`, its two custom domains, and its existing compatibility date. `nodejs_compat` is required by TanStack Start's Node stream and async hooks imports.

## Pages and assets

`src/routes/` defines `/`, `/about`, `/essays`, `/essays/$slug`, and `/404`. Vite prerenders all of them to `dist/client/*.html`; essay paths come from `content/essays/*.md`. The 404 HTML is served for unknown paths through Cloudflare static assets. `src/static-pages.ts` holds the page chrome for home, about, essays index, and 404. The home and essays lists are filled from essay frontmatter during rendering. `src/legacy-page.tsx` renders the page chrome with the same canvases, main markup, scripts, classes, and copy. The site uses the original `public/style.css` and browser scripts. Do not add the future superthread UI stack in this port.

`content/essays/<slug>.md` is the essay source. Frontmatter records page metadata, navigation order, the exact head markup and HTML article body, and the surrounding page chrome. The Markdown body after frontmatter is the public `.md` twin. `public/` contains static files at their original URLs, including `_headers`. The output of `tools/sync-essays.py` writes the essay Markdown twins and updates the feed, sitemap, `llms.txt`, and essays index Markdown. The existing Markdown bytes are preserved.

## Adding an essay

From the root, run:

```sh
python3 apps/web/tools/import-x-article.py <status-url> <slug> --summary "one lowercase line" [--linkedin <pulse-url>] [--seo-title "search title"]
python3 apps/web/tools/link-essays.py
python3 apps/web/tools/sync-essays.py
```

The home and essays index lists read the new frontmatter automatically. The sync tool updates the essay lists in `public/index.md` and `public/essays.md`. Then run `bun run build`, `bun run test`, and `node apps/web/tools/parity.mjs`. The parity harness compares against `apps/site`; for a new essay, update the reference only in a separate migration or adapt the harness baseline deliberately.

The signup routes use Worker secrets `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `TURNSTILE_SECRET`, and `SUBSCRIBE_SECRET`. `src/server-behavior.ts` contains the HTTP behavior. Keep the 301 apex redirect, Markdown negotiation, MCP tools, signup, alias redirects, and `_headers` semantics intact.
