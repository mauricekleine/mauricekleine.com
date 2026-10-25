# registry

`@mk` is a shadcn registry of Base UI items on the superthread tokens, served at https://superthread.mauricekleine.com/r/. The version is `2.0.0-next.2`. Each item's page on the site shows it in light and dark with its install line.

## items

| tier  | items                                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| style | `init`, `tokens`                                                                                                                                                           |
| lib   | `tokens-plain`, `utils`, `fleet`                                                                                                                                           |
| brand | `glyphs`, `button`, `badge`, `input`, `input-group`, `textarea`, `select`, `checkbox`, `dialog`, `toast`, `tabs`, `table`, `progress`, `skeleton`, `sidebar`, `fleet-rail` |
| pass  | `card`, `label`, `separator`, `sheet`, `tooltip`, `use-mobile`                                                                                                             |

- **style**: `init` sets up an app; `tokens` is the theme (colour roles, type, motion, shape and the texture tiles).
- **lib**: `utils` is `cn`, taught the type steps; `fleet` lists the ships; `tokens-plain` is the theme as plain CSS and a typed module.
- **brand**: superthread's own components. They keep shadcn's Base UI API (exports, props, `data-slot`, variants) and add `data-mk="<item>"` on the root.
- **pass**: base-nova's items as shadcn ships them, on the superthread tokens.

## install

The tested layout is a TanStack Start app on Tailwind 4:

```sh
bunx --bun shadcn@latest init https://superthread.mauricekleine.com/r/init.json --base base -y
bunx --bun shadcn@latest add @mk/tokens @mk/button
```

Init writes the base-nova style and `"@mk": "https://superthread.mauricekleine.com/r/{name}.json"` into `components.json`, and installs `@mk/utils`, `@mk/tokens` and `@mk/button`. After that, `bunx --bun shadcn@latest add @mk/<item>` installs any item and its `@mk` dependencies, and `bunx --bun shadcn@latest search @mk` lists them all.

Items install in `superthread/` under the components directory (`ui/`, `lib/`, `hooks/`, `styles/`), apart from `components/ui/`, so `shadcn apply` and `init --reinstall` leave them alone. Import them from `@/components/superthread/ui/<item>`.

## the css entry

`@mk/tokens` adds three lines after the entry's `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./components/superthread/styles/superthread.css";
```

The last path assumes the Start layout, with `src/styles.css` beside `src/components/`. In another layout, point it from the CSS entry to the installed file; in a Next.js app with `app/globals.css` and `components/` at the root, that is `../components/superthread/styles/superthread.css`.

A surface without Tailwind installs `@mk/tokens-plain`: `styles/superthread-plain.css` (the same variables, faces and texture rules) and `lib/tokens.ts` (the values as a typed module).

## modes

- `:root` and `.light` are light. `.dark` on an ancestor is dark, and a `.light` inside it is light again, so two specimens can sit side by side.
- Raised layers (dialog, select list, toast, sheet) portal to the end of `<body>` and take the document's mode, so the mode class goes on `<html>`.
- The tokens carry the mode, so items and app code use roles, never `dark:` classes.

## fonts and origins

The tokens load nine faces from `https://superthread.mauricekleine.com/fonts/`. Unbounded and Fragment Mono (OFL) load on any origin. Supreme and Erode (ITF) load only on `*.mauricekleine.com`, `mk.wtf` and localhost; on any other origin those two fall back to system fonts. To print in all four faces, a surface runs on one of those origins.

## the fleet rail

```tsx
<FleetRail current="orbit" hrefs={{ home: "https://...", quanta: "https://..." }} sidebar={<ShipNav />}>
  <main>...</main>
</FleetRail>
```

- `current` is the ship's id; its cell is boxed in plum.
- `hrefs` maps `home` and ship ids to URLs. The registry ships no hostnames, and a ship without an href prints as a disabled cell.
- `sidebar` is the ship's own nav, which prints beside the rail on the deep ground.
- `markBase` changes where the marks load from; `label` is the rail's accessible name (default `fleet`).

## pinning a version

Map `@mk` to a snapshot instead of the latest build:

```json
{ "registries": { "@mk": "https://superthread.mauricekleine.com/r/v/2.0.0-next.2/{name}.json" } }
```

Nested dependencies resolve through the same mapping, so every item comes from that version. `/r/versions.json` lists the versions with a snapshot. A snapshot never changes once it is published.

## updating an installed item

- Every installed file names its item and version: `// @mk/<item> <version>` after the imports in TS and TSX, `/* @mk/<item> <version> */` on line 1 in CSS.
- `bunx --bun shadcn@latest add @mk/<item> --diff` shows how the installed file differs from the registry; `--overwrite` takes the registry's version.
- Installed files stay as the registry writes them. A fix goes into `packages/superthread/items/` in the mauricekleine.com repo, and any change to a served item after its version is published ships as the next version, `2.0.0-next.N`.

## changing an item

Brand items hold these rules, and the package's item tests enforce them:

- Every field (`input`, `textarea`, `input-group`, the `select` trigger) has one focus state, the 2 px edge inside its box in `--fx`. A text control inside a box draws no outline; a button inside a box keeps its own ring.
- `outline-none` and `outline-hidden` stay out of every class list: in Tailwind 4 both remove the focus ring.
- No `dark:` classes.
- At most one texture detail per component, from the six in [texture](texture.md).

`packages/superthread/README.md` covers the scripts, the clean room that installs every item into a fresh app, snapshots and cutting the next version.

## v1

www's `/r` serves v1, frozen: `https://www.mauricekleine.com/r/superthread.json` and `/r/fleet-rail.json`. It is a separate registry, and a surface installs from one or the other.
