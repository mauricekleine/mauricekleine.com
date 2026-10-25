# superthread.mauricekleine.com

`apps/superthread/` is the superthread design system's site: a TanStack Start app on Workers that renders the `@mk` registry's own item sources from `packages/superthread/items/` and serves the registry under `/r`. The Worker is `superthread`; it has no domain until the operator step.

## Commands

Run from the repository root:

```sh
bun run dev:superthread        # http://127.0.0.1:3001
bun run build:superthread
bun run --cwd apps/superthread test
bun apps/superthread/tools/shoot.ts --base http://127.0.0.1:3001 --tag <name>
bun apps/superthread/tools/shoot.ts --focus --base http://127.0.0.1:3001 --tag <name>
```

`build:superthread` stamps `public/api/deploy.json`, regenerates the v2 CSS in `packages/superthread`, writes the registry into `public/r/` (both gitignored), then runs the app's `build`: `vite build`, `bun --check` and `tools/check-build.mjs`. The build output is `.cloudflare/output/v0/workers/default/assets`. `SUPERTHREAD_BASE_URL` changes the `@mk` URL in `r/init.json` and nothing else. `deploy:superthread` is the operator's step.

## Layout

- `src/site/nav.ts` is the nav tree and the prerender list. A page that is not in it is not built.
- `src/routes/__root.tsx` renders the document: `HeadContent`, then the `Shell` (docs) or `AppShell` (mock pages) the nav entry names. The Worker (`src/server.ts`) puts the theme script first in `<head>`, ahead of what React hoists there.
- `src/site/` holds the shell (masthead, search, nav, aside, mode control) and the content blocks pages share: `PageHead`, `Section`, `CodePatch`, `InstallLine`, `CropMarks`, `Plate`, `ModePair`, `Swatch` and `Caption`.
- `src/styles/app.css` imports Tailwind, shadcn's `tailwind.css`, the v2 site CSS and one stylesheet per area. Its `data-demo` variants let a static specimen print a real state (`data-demo="focus"`, `"hover"` and the rest) from the item's own classes.
- Items come through the `@/components/superthread` alias. Fix an item in `packages/superthread/items/`, never in the site.
- Mock pages import only `@/components/superthread/**`, `src/mock/**` and `AppShell`; `check-build` fails on anything else.
- `src/site/texture.gen.ts` is generated (`build.py plates --ts`), as are `src/routeTree.gen.ts` and `public/r/`. Do not edit them by hand.

## Rules

- Words are lowercase and understated, with no em dashes and synthetic data only. `check-build` fails on an em dash or a private host in any served file.
- `.impeccable/surfaces/apps-superthread-src-routes-index-tsx.md` is the surface contract. Read it; never copy its text into source, markup or anything served. `check-build` fails on any 8-word run of its prose.
- The mode never flashes: the inline script in `src/site/theme-script.ts` sets `.dark`, `data-theme` and `data-theme-choice` on `<html>` before anything paints, and the mode control's pressed look reads `data-theme-choice` from CSS. `theme-script.test.ts` and `check-build` hold this.
- A field's box owns its focus: one 2 px edge inside the box, in `--primary` (`--error` when invalid), and no ring on the control. `tools/shoot.ts --focus` with `tools/focus_frames.py` proves it on every field page and the masthead search.
- Fonts come from `/fonts/` through the Worker (`src/server-behavior.ts`): OFL faces to anyone, Supreme and Erode only to Maurice's own origins and localhost. `tools/test-worker.mjs` covers each case.

## Shots

Shots go to `.shots/superthread/<tag>/` at the repository root (gitignored): every nav page at 1440 x 900 and 390 x 844, light and dark, after the fonts load. The dev and preview servers listen on 127.0.0.1 only (ports 3001 and 4173), so use 127.0.0.1 URLs; each exits when its port is busy. The shared dev server runs on 3001; a second server picks another free port (`bun run --cwd apps/superthread dev --port <port>`, where the last `--port` wins), and its starter stops it by PID.
