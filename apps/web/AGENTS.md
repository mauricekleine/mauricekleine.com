# mauricekleine.com web app

`apps/web/` is the live TanStack Start app. Read `PRODUCT.md` (product brief) and `DESIGN.md` (the site's visual design) in this folder before changing product or design; the shared design system tokens live in `packages/superthread/DESIGN.md`.

## Commands

Run from the repository root:

```sh
bun install
bun run dev
bun run build
bun run test
(cd apps/web && cf deploy --prebuilt --dry-run)
bun run deploy
```

Workers Builds uses `bun install && bun run --if-present build` as its build command, `bun run deploy` as the `main` deploy command, and `bun run --if-present deploy:preview` for other branches. `apps/web/cloudflare.config.ts` configures the Worker; the Vite plugin loads it through `experimental.newConfig` and writes cf's build output to `apps/web/.cloudflare/output/v0/`, which `cf deploy --prebuilt` uploads. The Worker keeps the name `mauricekleine-com`, its four custom domains, and its existing compatibility date. `nodejs_compat` is required by TanStack Start's Node stream and async hooks imports.

## Pages and assets

`src/routes/` defines `/`, `/about`, `/essays`, `/essays/$slug`, and `/404`. Vite prerenders all of them to `dist/client/*.html`; essay paths come from `content/essays/*.md`. The 404 HTML is served for unknown paths through Cloudflare static assets. `src/routes/__root.tsx` renders the shared document, canvases, `<main>`, and browser scripts. `src/pages/` holds home, about, essays index, and 404 as JSX. `src/components.tsx` holds the shared page structures. `src/seo.ts` builds route heads from typed data through TanStack Router `head()`.

`content/essays/<slug>.md` is the single essay source. Frontmatter contains data such as title, dates, social URLs, cover and image dimensions, and the five historical inline link targets that the public Markdown twin leaves unlinked. The body is the canonical public Markdown, byte for byte. `src/essay-markdown.tsx` renders it with React Markdown and GFM. `src/essay-content.ts` derives essay order from date and applies narrow render-only fixes for legacy Markdown syntax. The same source produces each public essay `.md` twin.

`public/` contains static files at their original URLs, including `_headers`. `tools/sync-essays.py` writes the essay Markdown twins and updates the feed, sitemap, `llms.txt`, and essays index Markdown. `public/index.md` and `public/about.md` remain byte-identical static files. `src/styles/site.css` imports the generated Superthread theme and builds to `public/style.css` without Tailwind preflight. The browser scripts remain in use. `/superthread` is a prerendered, route-scoped specimen that uses the generated shadcn theme and stock Base UI components. Its Tailwind CSS must never load on the existing pages.

## Adding an essay

From the root, run:

```sh
python3 apps/web/tools/import-x-article.py <status-url> <slug> --summary "one lowercase line" [--linkedin <pulse-url>] [--seo-title "search title"]
python3 apps/web/tools/link-essays.py
python3 apps/web/tools/sync-essays.py
```

The home and essays index lists read the new frontmatter automatically. Essay navigation follows date order; `link-essays.py` checks and reports that order. The sync tool updates the essay lists in `public/index.md` and `public/essays.md`. Then run `bun run build` and `bun run test`.

The signup routes use Worker secrets `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `TURNSTILE_SECRET`, and `SUBSCRIBE_SECRET`, declared with `bindings.secret()` so `cf deploy` fails if one is missing. Change them with `cf workers secrets bulk` or `cf workers versions create --secrets-file`; `cf workers secrets update` deletes every other secret (cloudflare/cf#96). `src/server-behavior.ts` contains the HTTP behavior. `/mcp` uses the official TypeScript SDK v2 `McpServer` and `createMcpHandler` for 2026-07-28 and stateless 2025 clients. Keep the 301 apex redirect, the mk.wtf short links, Markdown negotiation, MCP tools, signup, alias redirects, and `_headers` semantics intact.

## mk.wtf short links

`mk.wtf` and `www.mk.wtf` serve only the 302 short links in `src/links.ts`, for bios, slides and QR codes; pages and JSON-LD keep the real URLs. Top-level names are Maurice. A project's names prefix its own links, and every project name combines with every link name, so `f/gh` and `fluncle/github` resolve alike. Project destinations come from the manifest below; add a link as one entry in `src/links.ts` and add each resulting path to the expected table in `tools/test-worker.mjs`, which fails on any untested path.

## Projects

`src/projects.ts` is the manifest of side quests and the graveyard: names, canonical URLs, descriptions, team, project profiles, and how each live site credits Maurice. `tools/sync-projects.ts` writes `public/api/projects.json` and the side quests in `llms.txt` from it at build time (run it after editing; `bun run test` fails until you do). The pages, `src/links.ts` and the drift check import it. Hand-written copy (page JSX, `index.md`, `about.md`) keeps its own words, and `tools/test-projects.mjs` fails when a side quest link there or in either fleet rail copy disagrees with the manifest.

`.github/workflows/drift.yml` runs `tools/drift-check.mjs` daily and by hand. It checks each side quest's live site (reachable, canonical host, JSON-LD `@id` and visible credit where the manifest says so), every `mk.wtf` destination on a domain Maurice owns, and the profile README's side quest links, and keeps one "Drift: mauricekleine.com" issue open while anything disagrees.
