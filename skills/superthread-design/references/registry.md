# registry

`@mk` is a shadcn registry of Base UI and plain HTML items on the superthread tokens, served at https://superthread.mauricekleine.com/r/. `/r/versions.json` lists the versions. Each item's page on the site shows it in light and dark with its install line.

## items

| tier  | items                                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| style | `init`, `tokens`                                                                                                                                                           |
| lib   | `tokens-plain`, `doc`, `doc-react`, `utils`, `fleet`, `theme`, `time-words`, `use-minute`, `hotkey`                                                                                            |
| brand | `glyphs`, `button`, `button-group`, `toggle`, `toggle-group`, `badge`, `kbd`, `checkbox`, `radio-group`, `switch`, `slider`, `input`, `input-group`, `textarea`, `field`, `select`, `native-select`, `dialog`, `alert-dialog`, `dropdown-menu`, `combobox`, `command`, `toast`, `sonner`, `paper`, `fit-title`, `inline-answers`, `onward`, `source-line`, `source-mark`, `plate`, `weave`, `field-art`, `tabs`, `accordion`, `breadcrumb`, `table`, `progress`, `skeleton`, `resizable`, `sidebar`, `fleet-rail` |
| pass  | `card`, `collapsible`, `label`, `separator`, `sheet`, `tooltip`, `use-mobile` |
| block | `app-shell`, `page-header`, `section-header`, `collection-toolbar`, `list-rows`, `jump-line`, `item-cards`, `data-table`, `states`, `facts`, `form-section`, `quick-add`, `letter`, `send-bar`, `job-sheet`, `day-line`, `month-grid`, `reader`, `notice`, `search-palette` |

- **style**: `init` sets up an app; `tokens` is the theme (colour roles, type, motion, shape and the texture tiles).
- **lib**: `utils` is `cn`, taught the type steps; `fleet` lists the ships; `theme` holds the fleet's light and dark choice; `time-words` puts time in the fleet's words (`since friday`, `before 11:00`, `09:30`, `tue 3 nov`, `november 2026`, `48 min until standup`, `every day at 07:00`); `use-minute` is the clock's minute and the reader's day, from one shared timer that stops while the page is hidden; `hotkey` says whether a bare key press is the page's to answer, away from text and from layers that keep their keys; `tokens-plain` is the theme as plain CSS and a typed module. `doc` holds the plain HTML sections, styles and scripts. `doc-react` holds the same sections as React components.
- **brand**: superthread's own components. They keep shadcn's Base UI API (exports, props, `data-slot`, variants) and add `data-mk="<item>"` on the root.
- **pass**: base-nova's items as shadcn ships them, on the superthread tokens, plus the few rules upstream leaves out, such as the turn of `collapsible`'s chevron.
- **block**: the compositions the fleet's apps repeat, built from the items: a shell, headers, collections, forms, a letter, a send bar, a job sheet, a day line, a month grid, a reader, notices and states. Each installs at `components/superthread/blocks/<name>.tsx`; its meta names the apps it serves. Reach for a block before composing the same pattern by hand.

## install

The tested layout is a TanStack Start app on Tailwind 4:

```sh
bunx --bun shadcn@latest init https://superthread.mauricekleine.com/r/init.json --base base -y
bunx --bun shadcn@latest add @mk/tokens @mk/button
```

Init writes the base-nova style and `"@mk": "https://superthread.mauricekleine.com/r/{name}.json"` into `components.json`, and installs `@mk/utils`, `@mk/tokens` and `@mk/button`. After that, `bunx --bun shadcn@latest add @mk/<item>` installs any item and its `@mk` dependencies, and `bunx --bun shadcn@latest search @mk` lists them all.

Items install in `superthread/` under the components directory (`ui/`, `lib/`, `hooks/`, `styles/`, `blocks/`), apart from `components/ui/`, so `shadcn apply` and `init --reinstall` leave them alone. Import them from `@/components/superthread/ui/<item>`.

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

## documents

Use [the document specimens](https://superthread.mauricekleine.com/compositions/doc) to pick a section and copy its JSX or HTML. Both forms print with `styles/doc.css`.

### plain documents

Fetch `/r/v/<version>/doc.json` and `tokens-plain.json` at the same version. Copy the registry's `files[].content` by `target`. Put `doc/mode.js` in a classic inline script in `<head>`, then inline `styles/superthread-plain.css` and `styles/doc.css` in that order. Compose the body by register rather than cloning a boilerplate document:

- **Working sheets** (RFCs, audits, dossiers, specs, comparisons): open with `sheet-head` on white stock and separate sections with ruled `section-head` dividers. Skip decorative plates.
- **Briefs, reports, features and decks**: open with the framed split `opener` (uniform 1 px `border` hairlines, 3.5 px proof halftone plate with `vivid` light breath) and use `section-head` for subsections, reserving `chapter` (40 px plum bar + matching proof halftone plate) for 2 to 4 major act turns.
- **Draft review notes**: include `notes-toggle` in the top bar and inline `doc/notes.js` after the sections to enable inline text highlighting, margin notes and Markdown export.

Inline `doc/plate.js` in a classic script after the sections whenever `[data-plate]` or `[data-plate-src]` is used. The mode starts from `prefers-color-scheme` and the button flips `.dark` on `<html>` for this page. See [texture](texture.md#proof-plates-documents-and-visuals) for plate rules.

### react documents

Run `bunx --bun shadcn@latest add @mk/doc-react` and import `DocOpener`, `DocSheetHead`, `DocChapter`, `DocNotesToggle` and the rest from `@/components/superthread/ui/doc-react`. Link `styles/superthread-plain.css` then `styles/doc.css` in the document route's head. Run `themeScript` from `lib/theme` before first paint. The React sections mount their own proof halftone plates and notes layer, and use the fleet mode. Pass `still` to hold a plate on frame zero, `notesToggle={false}` on final published views, and `modeToggle={false}` when the page already has a control.

## modes

- `:root` and `.light` are light. `.dark` on an ancestor is dark, and a `.light` inside it is light again, so two specimens can sit side by side.
- Raised layers (dialog, select list, toast, sheet) portal to the end of `<body>` and take the document's mode, so the mode class goes on `<html>`.
- The tokens carry the mode, so items and app code use roles, never `dark:` classes.
- `@mk/theme` owns the mode. Render its `themeScript` in `<head>`, after a `<meta name="theme-color" data-light="..." data-dark="...">`, and the script sets the class, `data-theme`, `data-theme-choice`, `color-scheme` and the meta before anything paints.
- There is one choice across the fleet: the `mk-theme` cookie on `mauricekleine.com`, with a localStorage copy, following the system until someone picks. `FleetRail`'s mode cell sets it, so a ship adds no toggle or key of its own. Other controls use `useThemeChoice`, `useTheme`, `setThemeChoice` and `toggleTheme`.

## fonts and origins

The tokens load nine faces from `https://superthread.mauricekleine.com/fonts/`. Unbounded and Fragment Mono (OFL) load on any origin. Supreme and Erode (ITF) load only on `*.mauricekleine.com`, `mk.wtf` and localhost; on any other origin those two fall back to system fonts. To print in all four faces, a surface runs on one of those origins. A page under a CSP `sandbox` without `allow-same-origin` requests fonts as `Origin: null` and falls back too, even on those hosts, so the artifacts host and the share Worker serve the faces themselves at `/_fonts/<file>`, the path `mk artifacts` pages list first.

## the fleet rail

```tsx
<FleetRail current="orbit" hrefs={{ orbit: "/" }} sidebar={<ShipNav />}>
  <main>...</main>
</FleetRail>
```

- `current` is the ship's id; its cell is neutral, with an 8 px plum corner mark.
- `hrefs` maps `home` and ship ids to URLs, and only needs the links that differ from the fleet's. `@mk/fleet` carries each ship's public url from the marks manifest, so a ship left out links there and `home` links to superthread. Pass `"/"` for the app's own ship and `null` to unlink a cell. A ship with no url prints as a disabled cell, and one with `"rail": false` in the manifest (soliton) gets no cell.
- `sidebar` is the ship's own nav, which prints beside the rail on the deep ground. Above 900 px both stick to the top of the window while the panel scrolls.
- The last cell is the mode toggle.
- `markBase` changes where the marks load from; `label` is the rail's accessible name (default `fleet`).
- The rail brings a skip link to `#main`, and `AppShellGround` is that target when it renders `main`. Pass `skipLink={false}` for a rail embedded in a page that owns its own.

## pinning a version

Map `@mk` to a snapshot instead of the latest build:

```json
{ "registries": { "@mk": "https://superthread.mauricekleine.com/r/v/2.16.0/{name}.json" } }
```

Nested dependencies resolve through the same mapping, so every item comes from that version. `/r/versions.json` lists the versions with a snapshot. A snapshot never changes once it is published.

## updating an installed item

- Every installed file names its item and version: `// @mk/<item> <version>` after the imports in TS and TSX or on the last line of plain JS. Line 1 carries the stamp in CSS and HTML, as `/* @mk/<item> <version> */` or `<!-- @mk/<item> <version> -->`.
- A fleet ship takes a release with `mk apps sync <app> --pr`, or `--superthread <version>` for a release the template sits out.
- `bunx --bun shadcn@latest add @mk/<item> --overwrite --yes` takes the registry's version.
- To prove an app's items match the registry, copy the app, run `bunx --bun shadcn@latest add <items> --overwrite --yes` in the copy, then `diff -r` the copy against the app. `add --diff` is a preview, not that proof: it prints at most five of the files an add resolves, dependencies first, and exits 0 whether or not a file differs, so a change past the fifth file never shows.
- Installed files stay as the registry writes them. A fix goes into `packages/superthread/items/` in the mauricekleine.com repo, and any change to a served item after its version is published ships as the next version: a patch for a fix, a minor for a new item or variant.
- A ship never restyles an item from outside: no `[data-slot]` rule and no look class at a call site. Margins, widths and grid placement stay composition.

## changing an item

Brand items hold these rules, and the package's item tests enforce them:

- Every field (`input`, `textarea`, `input-group`, the `select` trigger) has one focus state, the 2 px edge inside its box in `--fx`. A text control inside a box draws no outline; a button inside a box keeps its own ring.
- `outline-none` and `outline-hidden` stay out of every class list: in Tailwind 4 both remove the focus ring.
- No `dark:` classes.
- At most one texture detail per component, from the six in [texture](texture.md).

`packages/superthread/README.md` covers the scripts, the clean room that installs every item into a fresh app, snapshots and cutting the next version.

## fleet installs

fleet apps install `@mk` v2 from `https://superthread.mauricekleine.com/r/v/<version>/{name}.json`. fleet rails load marks from `https://superthread.mauricekleine.com/marks` by default.

## plate

Add `@mk/plate` beside the v2 tokens. In React, import `Plate` from `ui/plate`, size it in CSS and pass `src` for a photograph/illustration, `draw` for a custom canvas callback, or `spec` for structure-driven `planes` or `grid` geometry (`breath` defaults to `vivid`). In a [plain document](#plain-documents), `doc/plate.js` mounts the same 3.5 px two-ink proof halftone renderer on every sized `[data-plate]` or `[data-plate-src]` host. Read [texture](texture.md#proof-plates-documents-and-visuals) for light/dark breath rules and no-photo direction.

## weave

Add `@mk/weave` beside the v2 tokens. In React, import `Weave` from `ui/weave` and set its `spec` and height. In a [plain document](#plain-documents), `doc/weave.js` mounts the same renderer on every sized element with a `data-weave` spec. The core has no runtime dependencies. `prepareWeave` and `paintWeave` print the same grammar for still plates and video. Read [texture](texture.md#weave) for the spec and the live rules.

## field art

Add `@mk/field-art` beside the v2 tokens. In React, import `FieldArt` from `ui/field-art` for concept art and set its `spec` and CSS size. Pass a stable `mask` callback for a custom edge and `playing` for the page’s live field.

On a plain page, give a sized, positioned, overflow-hidden host a `data-field-art` spec. Inline the item’s `doc/field-art.js` in a classic script after the hosts. Set `data-field-art-play` on the host that moves. Use `mountField(host, mask)` from `lib/field-live` for a custom mask.

Read [superthread-visuals](../../superthread-visuals/SKILL.md) for the spec, stills and loops.
