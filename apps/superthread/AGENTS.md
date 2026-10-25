# superthread.mauricekleine.com

`apps/superthread/` is the superthread design system's site and the home of v2: a TanStack Start app on Workers that renders the `@mk` registry's items as the registry serves them and serves the registry under `/r`, beside the faces (`/fonts/`), the ship marks (`/marks/`) and the plates it prints (`/texture/`). Its pages are the overview, the foundations (colour, type, space, motion, marks, texture), a page for every item, three mock app pages built only from the items, and `/install`. The Worker is `superthread`.

## Commands

Run from the repository root:

```sh
bun run dev:superthread        # http://127.0.0.1:3001
bun run build:superthread
bun run --cwd apps/superthread preview   # the built site, http://127.0.0.1:4173
bun run --cwd apps/superthread test
bun apps/superthread/tools/shoot.ts --base http://127.0.0.1:3001 --tag <name>
bun apps/superthread/tools/shoot.ts --focus --base http://127.0.0.1:3001 --tag <name>
```

`build:superthread` stamps `public/api/deploy.json`, regenerates the v2 CSS in `packages/superthread`, writes the registry into `public/r/`, writes every item's files from those payloads into `.payload/` (`tools/payload.mjs`; all three gitignored), then runs the app's `build`: `vite build`, `bun --check` and `tools/check-build.mjs`. A build renders the items from `.payload/`, so each page shows the bytes an app installs; `dev:superthread` writes it too, but dev renders the item sources so an edit reloads at once. The build output is `.cloudflare/output/v0/workers/default/assets`. `SUPERTHREAD_BASE_URL` changes the `@mk` URL in `r/init.json` and nothing else. `deploy:superthread` deploys that output, and only Maurice runs it.

## Layout

- `src/site/nav.ts` is the nav tree and the prerender list. A page that is not in it is not built.
- `src/routes/__root.tsx` renders the document: `HeadContent`, then the `Shell` (docs) or `AppShell` (mock pages) the nav entry names. The Worker (`src/server.ts`) puts the theme script first in `<head>`, ahead of what React hoists there.
- `src/site/` holds the shell (masthead, search, nav, aside, mode control) and the content blocks pages share: `PageHead`, `Section`, `CodePatch`, `InstallLine`, `CropMarks`, `Plate`, `ModePair`, `Swatch` and `Caption`.
- `src/styles/app.css` imports Tailwind, shadcn's `tailwind.css`, the v2 site CSS and one stylesheet per area. Its `data-demo` variants let a static specimen print a real state (`data-demo="focus"`, `"hover"` and the rest) from the item's own classes.
- Items come through the `@/components/superthread` alias. Fix an item in `packages/superthread/items/`, never in the site.
- Mock pages (`src/routes/mock/`) import only `@/components/superthread/**`, `src/mock/**`, `AppShell`, `react` and `@tanstack/react-router`. They show what an app builds from the registry alone, so `check-build` fails on any other import.
- `src/site/texture.gen.ts` is generated (`build.py plates --ts`), as are `src/routeTree.gen.ts` and `public/r/`. Do not edit them by hand.

## Rules

- Words are lowercase and understated, with no em dashes and synthetic data only. `check-build` fails on an em dash or a private host in any served file.
- `.impeccable/surfaces/apps-superthread-src-routes-index-tsx.md` is the surface contract. Read it; never copy its text into source, markup or anything served. `check-build` fails on any 8-word run of its prose.
- The mode never flashes: the inline script in `src/site/theme-script.ts` sets `.dark`, `data-theme` and `data-theme-choice` on `<html>` before anything paints, and the mode control's pressed look reads `data-theme-choice` from CSS. `theme-script.test.ts` and `check-build` hold this.
- A field's box owns its focus: one 2 px edge inside the box, in `--primary` (`--error` when invalid), and no ring on the control. `tools/shoot.ts --focus` with `tools/focus_frames.py` proves it on every field page and the masthead search.
- Fonts come from `/fonts/` through the Worker (`src/server-behavior.ts`): OFL faces to anyone, Supreme and Erode only to Maurice's own origins and localhost. The pinned snapshots under `/r/v/*` reach it first too: a file that exists keeps for a year, immutable, and a miss gets the 404 page with `no-store`. `public/_headers` sets no cache or CORS header on either path. `tools/test-worker.mjs` covers each case.

## Checks

- `build` ends in `tools/check-build.mjs`, which lists its nine checks at the top: every page prerendered with the theme script first, the served words, the contract's prose, provenance, plates, the registry against the snapshots in `PUBLISHED_VERSIONS` and its base, the deploy stamp, the mock pages' imports, and `.payload/` against the served payloads. A failure names the file; fix that file. A new snapshot version goes into `PUBLISHED_VERSIONS` in the change that cuts it.
- `test` runs `tools/test-worker.mjs` (the Worker's headers and font origins), `bun test src`, `tools/check-fonts.mjs` (`public/fonts/` against `packages/superthread/fonts.ts`) and `build.py verify` over `public/texture/`.
- `tools/shoot.ts --focus` shoots each field on the field pages and the masthead search at rest, after Tab, after a click and after typing, in both modes at 2x. `tools/focus_frames.py` counts the frames in each crop, and the run exits 1 when any field fails.
- The clean room can install from a built site instead of a local registry build. Build with the preview's base, serve it, run the clean room against it, then rebuild:

  ```sh
  SUPERTHREAD_BASE_URL=http://127.0.0.1:4173 bun run build:superthread
  bun run --cwd apps/superthread preview      # in the background; note its PID
  bun run test:clean-room -- --registry http://127.0.0.1:4173
  bun run build:superthread
  ```

  Stop the preview by the PID you noted. The clean room checks that `r/init.json` maps `@mk` to the base it installs from, so the base URL and `--registry` match.

## Plates, marks and provenance

- **Plates** are generated. From `apps/superthread/`, `python3 -I ../../packages/superthread/scripts/texture/build.py plates --out public/texture --ts src/site/texture.gen.ts` writes `<plate>.<hash8>.png` files, each with a tEXt `Source` chunk, plus `public/texture/PROVENANCE.json` and `texture.gen.ts`. It writes new files beside old ones, so remove the PNGs a change replaces; `verify`, `plates --check` and `check-build` fail on a file the spec no longer makes. A plate change starts in `packages/superthread/texture/plates.json`, with its pixel hashes rewritten into `texture/plates.sha256` (`--write-hashes`).
- **Marks** in `public/marks/<id>/` are byte copies of the master world's marks, light and `-dark`, for the six ships and superthread's home mark, which is also the favicon. `public/marks/PROVENANCE.json` records each file's source and sha256. A new or redrawn mark comes from the world and lands here with its provenance entry.
- **Fonts** in `public/fonts/` are the woff2 faces in `packages/superthread/fonts.ts`, each family with its licence beside it.

## Never

- Edit items, tokens or generated files from the site; change them at their source in `packages/superthread/` and regenerate.
- Change a snapshot under `packages/superthread/versions/` once it is on main, or anything www serves at its v1 `/r`.
- Copy the surface contract's prose, or print a private host, a client's name or real data on any page.
- Load fonts at runtime from Fontshare or Google; the faces are served from `/fonts/`.
- Add a domain, a Workers Builds project or a deploy. Those are Maurice's steps.

## Shots

Shots go to `.shots/superthread/<tag>/` at the repository root (gitignored): every nav page at 1440 x 900 and 390 x 844, light and dark, after the fonts load. `--only` narrows the pages. The dev and preview servers listen on 127.0.0.1 only (ports 3001 and 4173), so use 127.0.0.1 URLs; each exits when its port is busy. The shared dev server runs on 3001; a second server picks another free port (`bun run --cwd apps/superthread dev --port <port>`, where the last `--port` wins), and its starter stops it by PID.
