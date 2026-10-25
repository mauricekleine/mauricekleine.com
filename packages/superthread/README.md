# superthread

The design system for Maurice's fleet, as a shadcn registry. This package holds two versions side by side:

- **v1, frozen.** The theme www and the share Worker import (`dist/superthread.css`) and the two items www serves at `/r`. Nothing regenerates it.
- **v2.** Tokens generated from the master world, and the versioned `@mk` registry of Base UI items built on them. The version is `2.0.0-next.1`.

## Install v2

The registry is served at `https://superthread.mauricekleine.com/r/`. In a TanStack Start app on Tailwind 4, set up `@mk` with init, then add what you need:

```sh
bunx --bun shadcn@latest init https://superthread.mauricekleine.com/r/init.json --base base -y
bunx --bun shadcn@latest add @mk/tokens @mk/button
```

The init line is the form `upstream/cli/init-form.json` records: the clean room ran it in an existing app and it passed. Init writes the base-nova style and `"@mk": "https://superthread.mauricekleine.com/r/{name}.json"` into `components.json`, and installs `@mk/utils`, `@mk/tokens` and `@mk/button`. Every `bunx --bun shadcn@latest add @mk/<item>` after that resolves through the mapping, nested `@mk` dependencies included. The clean room gates on the package's pinned CLI (4.22.1) and tries `shadcn@latest` without gating.

Items install under the app's components directory, in `superthread/` (`ui/`, `lib/`, `hooks/`, `styles/`). `shadcn apply` and `init --reinstall` reset `components/ui/`, not this directory, so a reset leaves the branded files alone.

### the css entry

`@mk/tokens` adds three lines to the app's CSS entry, after its `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./components/superthread/styles/superthread.css";
```

The last line is relative to the Start layout, where `src/styles.css` sits beside `src/components/`. In any other layout, change it to the path from your CSS entry to the installed file. In a Next.js app with `app/globals.css` and `components/` at the root:

```css
@import "../components/superthread/styles/superthread.css";
```

Only the Start layout is tested. For a surface without Tailwind, `@mk/tokens-plain` installs `styles/superthread-plain.css` (the same variables, font faces and texture rules as plain CSS) and `lib/tokens.ts`, the values as a typed module.

### modes, fonts and marks

- `:root` and `.light` are light; `.dark` on an ancestor is dark. A `.light` inside a dark page renders light again, so specimens can sit side by side.
- Raised layers (dialog, select list, toast) portal to the end of `<body>` and take the document's mode, so put `.dark` on `<html>`.
- The tokens load their nine faces from `https://superthread.mauricekleine.com/fonts/`. Unbounded and Fragment Mono (OFL) load on any origin; Supreme and Erode (ITF) load only on `*.mauricekleine.com`, `mk.wtf` and localhost, and other origins fall back to system fonts for them. `fonts.ts` is the face manifest and holds each face's rule.
- The fleet rail ships no hostnames. Pass `hrefs` for the ships (and `home`), and `markBase` if the marks live somewhere other than `https://superthread.mauricekleine.com/marks`.

### pinning a version

Map `@mk` to a snapshot instead of the latest build:

```json
{ "registries": { "@mk": "https://superthread.mauricekleine.com/r/v/2.0.0-next.1/{name}.json" } }
```

Nested dependencies resolve through the same mapping, so every item comes from that version. `/r/versions.json` lists the versions that have a snapshot.

### workspace imports

Apps in this repo can import the package directly: `@mauricekleine/superthread/v2/theme.css`, `/v2/plain.css`, `/v2/tokens`, `/v2/tokens.json`, `/fleet` and `/fonts`. `/theme.css` is v1.

## What v2 holds

| tier  | items                                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| style | `init`, `tokens`                                                                                                                                                           |
| lib   | `tokens-plain`, `utils`, `fleet`                                                                                                                                           |
| brand | `glyphs`, `button`, `badge`, `input`, `input-group`, `textarea`, `select`, `checkbox`, `dialog`, `toast`, `tabs`, `table`, `progress`, `skeleton`, `sidebar`, `fleet-rail` |
| pass  | `card`, `label`, `separator`, `sheet`, `tooltip`, `use-mobile`: base-nova's items on the superthread tokens                                                                |

The tokens carry shadcn's colour roles plus the deep ground (the sidebar roles, `--ground`), status roles, code, control states and the ship spots; four lifts (`shadow-slip`, `-leaf`, `-sheet`, `-lifted`); the type steps as `type-<step>` utilities, from `type-meta` to `type-display`; three durations and one ease (`--ease-brand`); square corners; and the texture utilities. Two names differ from shadcn's habits: `--destructive` is the key ink, not red, and a status role's `-foreground` (`--success-foreground`) is the word ink, not a colour to print on `--success`.

Brand items keep shadcn's Base UI API (exports, props, `data-slot`, variants) and add `data-mk="<item>"` on the root. Their rules, which the item tests enforce:

- Every field (`input`, `textarea`, `input-group`, the `select` trigger) has one focus state: its box draws a 2 px edge inside itself in `--fx`, the house ink or the error ink when invalid. A text control inside a box draws no outline; a button inside a box keeps its own ring.
- No `outline-none` or `outline-hidden`: in Tailwind 4 both remove the focus ring. No `dark:` classes: the tokens carry the mode.
- At most one screened detail per component, from the master world's list: `texture-contact` (select list, dialog, toast, light mode only), `texture-mixed` (checkbox), `texture-tabhover` (tabs), `texture-rowedge` (table), `texture-disabled` (button and fields) and `texture-skeleton`. `texture-ramp` (the progress edge) and `texture-line-<ship>` (charts) are places, not details.

## The site

superthread.mauricekleine.com is v2's home. It renders every item from its source in `items/`:

- the overview, then the foundations: colour, type, space, motion, marks and texture
- a page for every item, with its install line
- `/mock/board`, `/mock/reading` and `/mock/orbit`: a task board, a reading page and an agents dashboard, built only from the items
- `/install`: init, adding an item, the css entry, pinning a version, and every item

It serves the `@mk` registry beside the pages. Init maps `@mk` to `https://superthread.mauricekleine.com/r/{name}.json`, so after the init line in [Install v2](#install-v2), `bunx --bun shadcn@latest add @mk/<item>` installs any item.

- `/r/<name>.json`, `/r/registry.json` and `/r/init.json`: the latest version
- `/r/v/<version>/<name>.json`: the snapshot committed in `versions/<version>/r/`, which never changes once it is on main; `/r/versions.json` lists the versions
- `/fonts/`, `/marks/` and `/texture/`: the faces the tokens load, the ship marks the fleet rail loads by default, and the plates the site prints

www's `/r/` is v1, frozen, and a separate registry: `https://www.mauricekleine.com/r/superthread.json` and `/r/fleet-rail.json` keep serving v1's bytes until the fleet rollout. Nothing the site serves changes them.

`apps/superthread/` holds the site. From the repo root, `bun run dev:superthread` serves it on port 3001, `bun run build:superthread` builds it with the registry, and `bun run deploy:superthread` deploys it. `apps/superthread/AGENTS.md` has the rest.

## Where things live

| path                                                                          | what                                                                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/master.json`                                                          | the master world's `tokens.json`, with the vendor's added keys (`desc`, from `build_reach.py`) after its last key. Never hand-edited        |
| `tokens/{details,glyphs,check}.json`, `tokens/master.source.json`             | data dumped from the world, and the sha256 of every file it came from                                                                       |
| `tokens/roles.ts`, `tokens/scale.ts`, `tokens/base.css`, `tokens/texture.css` | the role map, the type and motion scale, the base layer and the texture utilities, by hand                                                  |
| `fonts.ts`                                                                    | the face manifest                                                                                                                           |
| `scripts/texture/master/`                                                     | the world's own Python modules, vendored by name and unchanged                                                                              |
| `scripts/texture/build.py`                                                    | tiles, plates and pixel checks, run with those modules (stdlib only)                                                                        |
| `texture/`                                                                    | `tiles.json` (generated), `plates.json` (the plate spec), `plates.sha256` (pixel hashes) and `places.json` (the places' caption keys)       |
| `dist/v2/`                                                                    | the generated CSS and `tokens.json`                                                                                                         |
| `items/`                                                                      | item sources, at the paths they install to. `catalog.ts` lists the items. `lib/tokens.ts`, `lib/fleet.ts` and `ui/glyphs.tsx` are generated |
| `upstream/`                                                                   | base-nova as fetched, with its manifest; the recorded CLI mirror (`cli/`); the pinned Start template; shadcn's licence                      |
| `versions/<version>/r/`                                                       | committed snapshots                                                                                                                         |
| `v1/r/`                                                                       | v1's served JSON                                                                                                                            |
| `test/clean-room/`                                                            | the clean room, its fixture app and the page that renders every item                                                                        |

## Scripts

Run them from the repo root as `bun run --cwd packages/superthread <script>`.

| script       | what it does                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`      | generates `dist/v2/`, `items/lib/tokens.ts`, `items/lib/fleet.ts` and `items/ui/glyphs.tsx`                                                     |
| `check`      | fails when a generated file or `texture/tiles.json` is stale                                                                                    |
| `texture`    | rebuilds `texture/tiles.json`                                                                                                                   |
| `registry`   | builds the latest registry into `out/r/`. `--out <dir>` moves it; `--base-url <url>` (or `SUPERTHREAD_BASE_URL`) sets the `@mk` URL init writes |
| `snapshot`   | writes `versions/<version>/r/` at the production base                                                                                           |
| `upstream`   | `fetch`, `regen [--check]`, `print <name>` and `diff`: the base-nova mirror, the pass items and the brand seeds                                 |
| `vendor`     | `vendor <path to the master world> [--check]`: vendors the world. The path is required                                                          |
| `clean-room` | the clean room; `bun run test:clean-room` at the root runs the same                                                                             |
| `test`       | `bun test && bun --check`                                                                                                                       |
| `lint`       | `designmd lint DESIGN.md` with the pinned local copy                                                                                            |

At the root, `bun run registry` copies v1's JSON into `apps/web/public/r/`, and `bun run test` runs this package's tests with web's and share's.

After editing an input, regenerate in this order: `texture`, `build`, then `upstream regen`. When `texture/plates.json` changes, also rewrite the pixel hashes from this directory: `python3 -I scripts/texture/build.py plates --out "$TMPDIR/plates" --write-hashes texture/plates.sha256`. Builds copy committed outputs and never run Python; `check`, `texture` and the tests run `python3 -I` with the standard library only.

When the master world moves, run `vendor` against it, then regenerate. The tests fail on any world key the role map does not name, any detail no item claims, and any world contrast check the contrast test has not ported.

## The clean room

`bun run test:clean-room` builds the registry, serves it on 127.0.0.1 next to a recorded mirror of the CLI's own upstream requests, and drives the package's pinned shadcn against a copy of a pinned TanStack Start app:

1. add `@mk/tokens @mk/button` and build: the files, the `@import` lines, the stamps, `data-mk` in the prerendered page and the v2 tokens in the CSS
2. `search @mk` lists every item
3. the same add again changes no file, and `add --diff` reports nothing, then a real change
4. add every item and build a page that renders each brand item in light and dark
5. `apply nova` and `init --reinstall --preset nova` leave every installed file unchanged
6. init on a fresh app, in the recorded form
7. a pinned version installs the same files, once a snapshot exists
8. every upstream request came from the mirror, and none missed

The report lands in `test/clean-room/.out/report.json`. Flags: `--record` re-records the mirror and the init form (network; rerun when the CLI pin moves or a run misses on `/upstream`), `--keep <name>` keeps the app with every item installed, `--overlay <file...>` builds from `HEAD` plus only the named files, `--registry <url>` installs from a running site, `--cli latest` runs `shadcn@latest`, and `--refresh-lock` refreshes the fixture's lock when web's pins move.

To look at a kept app in a browser, run `bun test/clean-room/serve.ts <name>` from this directory. It serves the app on a free port on 127.0.0.1 in its own process group and writes the group and port to `test/clean-room/.out/`; `bun test/clean-room/serve.ts <name> --stop` stops that group. Run it directly, not through hyperspeed-run, which stops what its command started when the command exits.

This package pins its own shadcn (4.22.1) for the registry build, the mirror and the clean room. The root keeps 4.21.0, because www imports the root copy's `shadcn/tailwind.css`.

## Versions and stamps

- **Version.** `package.json` `version` is the one source for every item: `2.0.0-next.1` now, `2.0.0` at the fleet rollout.
- **Stamps.** Every installed file names its item and version. In TS and TSX, `// @mk/<item> <version>` sits on the line after the last import, or as the last line in a file with no imports, because the CLI strips a leading comment. In CSS, `/* @mk/<item> <version> */` is line 1.
- **Meta.** Each built item JSON carries `meta: { version, sha256, tier, upstream }`: the hash of its targets and contents, its tier, and the base-nova item and CLI it was seeded from. Meta stays in the registry and never reaches an installed file.
- **Paths.** Latest: `/r/<name>.json` and `/r/registry.json`. Pinned: `/r/v/<version>/<name>.json` and `/r/v/<version>/registry.json`. Index: `/r/versions.json`, `{ latest, versions }`.
- **Snapshots.** `versions/<version>/r/` holds that version's item JSONs and `registry.json`, with a `SHA256SUMS` beside them. A snapshot's `init.json` maps `@mk` to its own version. Once a snapshot is on main it never changes: CI fails a pull request that modifies or deletes one, and `registry.test.ts` fails when the current version's snapshot differs from a fresh build.

### cutting next.N

Any change to a served item after its version reaches main ships as the next version.

1. Set `version` in `package.json` to the next `2.0.0-next.N`.
2. `git fetch origin`, then `bun run --cwd packages/superthread snapshot`. It refuses a version that origin/main already holds.
3. Run `bun run test` and `bun run test:clean-room`, whose pinned step now installs from the new snapshot.
4. Commit the snapshot as the pull request's last commit. If an item changes again before the merge, retake it: the script replaces a snapshot that is not on main yet.

## v1, frozen

- `dist/superthread.css`, `registry.json` and `registry/ui/fleet-rail.tsx` stay byte-identical at their paths. www's `site.css` and `superthread-specimen.css`, the share Worker's pin page and `apps/web/tools/test-projects.mjs` read them.
- `v1/r/*.json` are the bytes www serves at `/r/superthread.json`, `/r/fleet-rail.json` and `/r/registry.json`, captured from the last v1 build. Root `bun run registry` copies them with `scripts/publish-v1.ts`. No shadcn build runs for v1, so a CLI upgrade cannot change them.
- `test/v1-frozen.test.ts` pins the sha256 of every one of these files.
- www's `/r` stays v1 until the fleet rollout. Existing consumers keep installing `https://www.mauricekleine.com/r/superthread.json` and `/r/fleet-rail.json`.
