---
version: alpha
name: superthread
description: maurice kleine's design system for his fleet, v2. key ink on white stock, plum for every control, screens only where you look.
# Colours are the tokens dist/v2/superthread.css emits. A key `x` is the variable `--x` on `:root` and `.light`;
# `dark-x` is the same variable under `.dark`. The css carries each as oklch(), which .impeccable/design.json
# records as `canonical`; the value here is the master world's hex (with its alpha, as rgb(), on the scrim) that
# the css is converted from. A role v1 did not declare is marked `# provisional`, as dist/v2/tokens.json marks it,
# until a later release confirms it. test/design-doc.test.ts holds every value below to the generated css.
colors:
  # light: --<role> on :root and .light
  background: "#ffffff"
  foreground: "#16181d"
  card: "#ffffff"
  card-foreground: "#16181d"
  popover: "#ffffff"
  popover-foreground: "#16181d"
  primary: "#aa337a"
  primary-foreground: "#ffffff"
  secondary: "#f1f1f1"
  secondary-foreground: "#16181d"
  muted: "#f9f9f9"
  muted-foreground: "#646465"
  accent: "#f7f2f4"
  accent-foreground: "#16181d"
  destructive: "#16181d"
  destructive-foreground: "#ffffff" # provisional
  border: "#e7e7e7"
  input: "#838384"
  ring: "#aa337a"
  sidebar: "#2e2f32"
  sidebar-foreground: "#ffffff"
  sidebar-primary: "#c074a1"
  sidebar-primary-foreground: "#16181d"
  sidebar-accent: "#503246"
  sidebar-accent-foreground: "#ffffff"
  sidebar-hover: "#4e4e50" # provisional
  sidebar-border: "#727273"
  sidebar-ring: "#c074a1"
  success: "#5e6e42" # provisional
  success-glyph: "#5e6e42" # provisional
  success-foreground: "#4c5a34" # provisional
  success-wash: "#f5f8f1" # provisional
  success-edge: "#b6bab0" # provisional
  info: "#405d7b" # provisional
  info-glyph: "#405d7b" # provisional
  info-foreground: "#3a5571" # provisional
  info-wash: "#f2f7fd" # provisional
  info-edge: "#afb6bf" # provisional
  warning: "#a48551" # provisional
  warning-glyph: "#a48551" # provisional
  warning-foreground: "#6f562a" # provisional
  warning-wash: "#faf6ef" # provisional
  warning-edge: "#cfc2b3" # provisional
  error: "#7c3832" # provisional
  error-glyph: "#813933" # provisional
  error-foreground: "#7c3832" # provisional
  error-wash: "#fef4f3" # provisional
  error-edge: "#843c36" # provisional
  error-solid: "#843c36" # provisional
  error-solid-foreground: "#ffffff" # provisional
  neutral: "#7d7e7e" # provisional
  neutral-glyph: "#7d7e7e" # provisional
  neutral-foreground: "#646465" # provisional
  neutral-wash: "#fafbfb" # provisional
  neutral-edge: "#bfc0c0" # provisional
  ground: "#2e2f32" # provisional
  ground-foreground: "#ffffff" # provisional
  rule: "#16181d" # provisional
  selection: "#eee3e8" # provisional
  disabled: "#bfc0c0" # provisional
  faint: "#f9f9f9" # provisional
  first: "#16181d" # provisional
  key: "#16181d" # provisional
  scrim: "rgb(22 24 29 / 0.42)" # provisional
  code: "#16181d" # provisional
  code-foreground: "#ffffff" # provisional
  code-muted: "#bbbbbb" # provisional
  code-border: "#3e3f42" # provisional
  code-accent: "#c074a1" # provisional
  code-ring: "#c074a1" # provisional
  primary-hover: "#9a2f6f" # provisional
  primary-press: "#8b2b65" # provisional
  secondary-hover: "#e7e7e7" # provisional
  secondary-press: "#d7d7d8" # provisional
  control-hover: "#f9f9f9" # provisional
  control-press: "#f1f1f1" # provisional
  raised-hover: "#f9f9f9" # provisional
  raised-press: "#f1f1f1" # provisional
  destructive-hover: "#646465" # provisional
  destructive-press: "#727273" # provisional
  raised-edge: "transparent" # provisional
  chart-1: "#2d9ff2" # provisional
  chart-2: "#a970f0" # provisional
  chart-3: "#39b357" # provisional
  chart-4: "#e3ae34" # provisional
  chart-5: "#e9772a" # provisional
  ship-orbit: "#2d9ff2" # provisional
  ship-quanta: "#39b357" # provisional
  ship-trisys: "#e9772a" # provisional
  ship-constellation: "#a970f0" # provisional
  ship-artifacts: "#e3ae34" # provisional
  ship-soliton: "#6272e9" # provisional
  shadow-ink: "#020203" # provisional
  # dark: --<role> under .dark
  dark-background: "#16181d"
  dark-foreground: "#e7e7e7"
  dark-card: "#242629"
  dark-card-foreground: "#e7e7e7"
  dark-popover: "#242629"
  dark-popover-foreground: "#e7e7e7"
  dark-primary: "#c074a1"
  dark-primary-foreground: "#16181d"
  dark-secondary: "#3e3e40"
  dark-secondary-foreground: "#e7e7e7"
  dark-muted: "#242629"
  dark-muted-foreground: "#b2b2b2"
  dark-accent: "#503246"
  dark-accent-foreground: "#e7e7e7"
  dark-destructive: "#e7e7e7"
  dark-destructive-foreground: "#16181d" # provisional
  dark-border: "#37373a"
  dark-input: "#888889"
  dark-ring: "#c074a1"
  dark-sidebar: "#0d0f12"
  dark-sidebar-foreground: "#e7e7e7"
  dark-sidebar-primary: "#c074a1"
  dark-sidebar-primary-foreground: "#16181d"
  dark-sidebar-accent: "#503246"
  dark-sidebar-accent-foreground: "#e7e7e7"
  dark-sidebar-hover: "#424243" # provisional
  dark-sidebar-border: "#727273"
  dark-sidebar-ring: "#c074a1"
  dark-success: "#95a67b" # provisional
  dark-success-glyph: "#95a67b" # provisional
  dark-success-foreground: "#95a67b" # provisional
  dark-success-wash: "#2c322a" # provisional
  dark-success-edge: "#636f53" # provisional
  dark-info: "#94b0cd" # provisional
  dark-info-glyph: "#94b0cd" # provisional
  dark-info-foreground: "#94b0cd" # provisional
  dark-info-wash: "#2c343e" # provisional
  dark-info-edge: "#627589" # provisional
  dark-warning: "#e6c99a" # provisional
  dark-warning-glyph: "#e6c99a" # provisional
  dark-warning-foreground: "#e6c99a" # provisional
  dark-warning-wash: "#423b31" # provisional
  dark-warning-edge: "#9a8667" # provisional
  dark-error: "#dca59a" # provisional
  dark-error-glyph: "#dca59a" # provisional
  dark-error-foreground: "#dca59a" # provisional
  dark-error-wash: "#3f3131" # provisional
  dark-error-edge: "#a55b4e" # provisional
  dark-error-solid: "#a55b4e" # provisional
  dark-error-solid-foreground: "#ffffff" # provisional
  dark-neutral: "#888889" # provisional
  dark-neutral-glyph: "#888889" # provisional
  dark-neutral-foreground: "#9f9f9f" # provisional
  dark-neutral-wash: "#2e2f32" # provisional
  dark-neutral-edge: "#5a5b5c" # provisional
  dark-ground: "#0d0f12" # provisional
  dark-ground-foreground: "#e7e7e7" # provisional
  dark-rule: "#727273" # provisional
  dark-selection: "#71455f" # provisional
  dark-disabled: "#5c5c5e" # provisional
  dark-faint: "#2e2f32" # provisional
  dark-first: "#ffffff" # provisional
  dark-key: "#16181d" # provisional
  dark-scrim: "rgb(0 0 0 / 0.6)" # provisional
  dark-code: "#0d0f12" # provisional
  dark-code-foreground: "#e7e7e7" # provisional
  dark-code-muted: "#b2b2b2" # provisional
  dark-code-border: "#37373a" # provisional
  dark-code-accent: "#c074a1" # provisional
  dark-code-ring: "#c074a1" # provisional
  dark-primary-hover: "#cd80ad" # provisional
  dark-primary-press: "#d88eb9" # provisional
  dark-secondary-hover: "#494a4c" # provisional
  dark-secondary-press: "#5c5c5e" # provisional
  dark-control-hover: "#242629" # provisional
  dark-control-press: "#37373a" # provisional
  dark-raised-hover: "#37373a" # provisional
  dark-raised-press: "#494a4c" # provisional
  dark-destructive-hover: "#cccccc" # provisional
  dark-destructive-press: "#ababab" # provisional
  dark-raised-edge: "#494a4c" # provisional
  dark-chart-1: "#55acf3" # provisional
  dark-chart-2: "#b085ec" # provisional
  dark-chart-3: "#4ec769" # provisional
  dark-chart-4: "#e7b546" # provisional
  dark-chart-5: "#f38745" # provisional
  dark-ship-orbit: "#55acf3" # provisional
  dark-ship-quanta: "#4ec769" # provisional
  dark-ship-trisys: "#f38745" # provisional
  dark-ship-constellation: "#b085ec" # provisional
  dark-ship-artifacts: "#e7b546" # provisional
  dark-ship-soliton: "#6a7be5" # provisional
  dark-shadow-ink: "#000000" # provisional
typography:
  meta:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 14px
    letterSpacing: 0.14em
  instrument:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
  ui:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
  summary:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 24px
  subtitle:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 24px
  read:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 32px
  read-phone:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 30px
  lede:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 33px
  lede-phone:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 31px
  title:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: 22px
    fontWeight: 300
    lineHeight: 28px
    letterSpacing: -0.02em
  section:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 34px
    letterSpacing: -0.03em
  page:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.01em
  page-phone:
    fontFamily: "Erode, ui-serif, Georgia, serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 34px
    letterSpacing: -0.01em
  hero:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 68px
    letterSpacing: -0.04em
  hero-phone:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: 52px
    fontWeight: 300
    lineHeight: 56px
    letterSpacing: -0.04em
  display:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: 76px
    fontWeight: 300
    lineHeight: 80px
    letterSpacing: -0.04em
  wordmark:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontWeight: 400
    letterSpacing: -0.02em
rounded:
  radius: 0px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px
  "12": 48px
  "16": 64px
  "24": 96px
  row-board: 56px
  row-table: 48px
  row-nav: 32px
---

# Design System: superthread

## Overview

**Creative North Star: "the two-ink proof"**

Superthread prints every fleet surface the way a two-ink proof prints: key ink on white stock, plum for everything you act on, and 1-bit screens only where the eye is meant to rest. The master world's own thesis states the rule the rest follows: flat where you read, screened where you look. Words, numbers, data and code always sit on flat ink. Screens print in five places and as at most one small detail per component, beside the content and never behind it.

The register is quiet and exact. Square corners, 1 px edges and horizontal rules that reach both window edges carry the structure, so a page needs no rounded cards on grey, no gradient accent and no glow. Dark mode is the same proof printed white on key: every neutral in both modes is a tint of the two inks, mixed in linear light, and most sit on one eleven-step wedge. There are two surfaces. Docs and public pages print on the stock. A ship's working surface prints on the deep ground, with the fleet rail and the ship's nav flat on the ground and the working panel raised on it by a soft rake from the upper left.

Every value comes from one source, `tokens/master.json`, vendored unchanged from the approved master world. `scripts/generate.ts` emits it as `dist/v2/superthread.css` (Tailwind 4), `dist/v2/superthread-plain.css` (no Tailwind) and `dist/v2/tokens.json`, and the `@mk` registry installs it into apps. The frontmatter above restates the emitted colour, type, radius and space tokens; motion, elevation, breakpoints and texture live in `.impeccable/design.json`, because the format has no place for them.

**Key Characteristics:**

- Two inks: key `#16181d` on white stock `#ffffff`, and white on key in dark. Every neutral is a tint of the two.
- One house ink, plum (`#aa337a`, dark `#c074a1`), for every control, link, focus ring and current item.
- Five statuses at badge scale only, each with its glyph square and its word. Failed is the one solid badge.
- Six ship spots that print only in their marks and chart series.
- Four faces with one job each: Unbounded, Supreme, Erode and Fragment Mono.
- Radius 0, 1 px edges, full-bleed rules.
- One focus ring for controls and one inside edge for fields.
- Raised layers lift by a raked shadow; in light their contact edge prints as a 50 percent screen.
- Three durations on one ease. Reduced motion zeroes them and keeps every state.

## Colors

A two-ink palette: the key and its wedge carry everything neutral, plum carries every control, and colour beyond those two lives only in status badges, ship marks and chart series.

App code names the role (`bg-primary`, `text-muted-foreground`, `border-input`), never a value; the `.dark` class on `<html>` switches every role at once. `.light` inside a dark page, or `.dark` inside a light one, makes an island in the other mode.

### Primary

- **Plum, the house ink** (`primary` and `ring`: `#aa337a`, dark `#c074a1`): primary actions, links, focus rings, the current item's edge and corner square, the progress fill, the tab bar and row edge, the second plate of the opener and figures, and the fleet rail's home cell. It is the only chromatic ink a control ever takes. The label on it, `primary-foreground` (stock in light, key in dark), measures 6.06:1 in light and 5.29:1 in dark.
- **Plum, hover and pressed** (`primary-hover` `#9a2f6f` / `#cd80ad`, `primary-press` `#8b2b65` / `#d88eb9`): in light the ink overprints darker; in dark it lifts in lightness. A pressed primary button adds a 1 px key inset.
- **Plum tints** (`accent` `#f7f2f4` / `#503246`, house 12 and 14; `selection` `#eee3e8` / `#71455f`, house 24 and 30): the boxed current item's fill and selected text. Words inside these fills print in `foreground` or `muted-foreground`, never in plum.

### Neutral

- **Key** (`foreground` `#16181d`, also `key` in both modes and `first` in light): the first ink. In dark the first ink is white (`first` `#ffffff`), and words print in paper 80 (`dark-foreground` `#e7e7e7`).
- **Stock** (`background`, `card`, `popover`: `#ffffff`; dark `background` `#16181d`, dark `card` and `popover` `#242629`): the paper. In light every raised surface is the stock itself; in dark it lifts one wedge step and draws a 1 px edge.
- **The wedge.** In light the key prints over white at 100, 98, 88, 78, 64, 48, 32, 20, 12, 5 and 0 percent; in dark white prints over key at 80, 60, 44, 24, 16, 10, 6, 4, 3, 1 and 0. Each neutral role names its tint. Light: `muted-foreground` key 88 (`#646465`), `input` 78 (`#838384`), `disabled` 48 (`#bfc0c0`), `border` 20 (`#e7e7e7`), `secondary` 12 (`#f1f1f1`), `muted` and `faint` 5 (`#f9f9f9`). Dark: `muted-foreground` 44 (`#b2b2b2`), `input` 24 (`#888889`), `rule` 16 (`#727273`), `disabled` 10 (`#5c5c5e`), `secondary` 4 (`#3e3e40`), `border` 3 (`#37373a`), `faint` 2 (`#2e2f32`, between the wedge's 3 and 1), `muted` 1 (`#242629`).
- **Rule** (`rule`: key in light, `#727273` in dark): the page's full-bleed rules, stronger than `border`.
- **Destructive is key** (`destructive` `#16181d` / `#e7e7e7`): a destructive action prints in the first ink with the trash glyph and its word. Red is a status colour.
- **Control states**: `secondary-hover` and `-press`; `control-hover` and `-press` for outline and ghost; `raised-hover` and `-press` for options and buttons on a raised layer; `destructive-hover` and `-press`. Light overprints key tints; dark lifts paper tints. `raised-edge` is transparent in light and paper 6 (`#494a4c`) in dark, the 1 px edge a raised surface draws there.
- **The deep ground** (`ground` `#2e2f32`, key 98; dark `#0d0f12`, key printed twice; `ground-foreground` `#ffffff` / `#e7e7e7`): the field a ship surface prints on, dark in both modes. What prints flat on it takes the dark palette in both modes, which the `sidebar-*` roles carry: `sidebar-primary` and `sidebar-ring` are plum's dark value, `sidebar-accent` is `#503246`, `sidebar-border` is `#727273`, and `sidebar-hover` is paper 5 over the ground (`#4e4e50` / `#424243`).
- **The code patch** (`code` `#16181d` / `#0d0f12`, `code-foreground`, `code-muted` for the prompt, `code-border` for separators): install lines and code blocks print dark in both modes. Package names and the copy link's ring (`code-accent`, `code-ring`) print in plum's dark value `#c074a1` in both modes.
- **Scrim** (`scrim`: the key at 42 percent in light, black at 60 percent in dark): the field under a modal layer, with no blur.
- **Shadow ink** (`shadow-ink`: `#020203`, the key printed twice, in light; `#000000` in dark): every shadow and the contact screen.

### Status

Five states, at badge scale only. A badge is a fill near the stock (`-wash`), a 1 px edge at about half strength (`-edge`: the glyph over the stock in linear light, 0.60 in light and 0.40 in dark), a 14 px glyph square at full strength (`-glyph`) and the word (`-foreground`). The states part by glyph, word and square, never by colour alone. These roles are new in v2 and provisional.

| state   | role      | glyph | light glyph / word    | dark glyph / word     |
| ------- | --------- | ----- | --------------------- | --------------------- |
| done    | `success` | tick  | `#5e6e42` / `#4c5a34` | `#95a67b` / `#95a67b` |
| running | `info`    | i     | `#405d7b` / `#3a5571` | `#94b0cd` / `#94b0cd` |
| waiting | `warning` | pause | `#a48551` / `#6f562a` | `#e6c99a` / `#e6c99a` |
| failed  | `error`   | cross | `#813933` / `#7c3832` | `#dca59a` / `#dca59a` |
| queued  | `neutral` | dash  | `#7d7e7e` / `#646465` | `#888889` / `#9f9f9f` |

- `success`, `info` and `warning` are the glyph inks under shadcn's names. `error` is the error text and the invalid field's edge, which follow failed.
- Failed is madder, the fleet's one red, and the one solid badge: `error-solid` (`#843c36` / `#a55b4e`) under `error-solid-foreground` (`#ffffff`). Its form makes it the most urgent state, so its ink stays at chroma 0.11 or less and 12 or more from plum (oklab delta E x 100).
- Every word clears its floor on its own fill, and every glyph on its fill and on `background`, `card` and `muted`; `test/contrast.test.ts` ports each check the master world runs.

### Ship spots

Each ship has one bright spot. It prints in the ship's mark (so its rail cell and fleet row) and in its chart series, and nowhere else. `--ship-<id>` names each; `--chart-1` to `--chart-5` are orbit, constellation, quanta, artifacts and trisys. These roles are new in v2 and provisional.

| ship          | spot         | light     | dark      | line screen angle |
| ------------- | ------------ | --------- | --------- | ----------------- |
| orbit         | comet blue   | `#2d9ff2` | `#55acf3` | 45                |
| quanta        | quark green  | `#39b357` | `#4ec769` | 90                |
| trisys        | flare orange | `#e9772a` | `#f38745` | 27                |
| constellation | nova violet  | `#a970f0` | `#b085ec` | 63                |
| artifacts     | manila gold  | `#e3ae34` | `#e7b546` | 135               |
| soliton       | canal indigo | `#6272e9` | `#6a7be5` | 117               |

Every spot stays at least 10 from plum (oklab delta E x 100), and its dithered region clears 3:1 on its mark's tile.

### Screens

A screen is a 1-bit pattern that stands in for a tint, and a flat tint equals the linear-light average of its screen, so the two read as one ink. Screens come from a 4 x 4 bayer matrix in steps of 6.25 percent: `--texture-b50` prints 50 percent (8 of 16 cells) and `--texture-b19` prints 18.75 percent (3 cells). CSS inks every screen through a mask at the tile's own whole-pixel size, so the mode and the house ink re-ink it, and it stays crisp at 1x and 2x. 50 percent is the in-between state; solid is the settled one.

The five places, in the world's order:

| place             | what prints                                                       | where it ships                                |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| opener            | one screened band per page head, inside crop marks                | plates from `texture/plates.json`             |
| figures           | reading figures in two inks, and chart series as line screens     | plates; `texture-line-<ship>`                 |
| marks             | the ship's spot region as a 1 px checker at 50 percent            | the mark SVGs                                 |
| state fields      | the progress fill's leading 24 px, ramped from solid to the stock | `texture-ramp`, inside `Progress`             |
| empty and loading | a light key wedge                                                 | the empty plates; `Skeleton` for loading rows |

A chart series prints in its ship's spot with 1 px lines knocked out to the stock every 4 px at the ship's angle, so it reads by colour first and by angle without colour. Every screened field gets crop marks: 10 px corner ticks, 16 px outside the field. `scripts/texture/build.py plates` builds the plates: a masks plate prints a first plate and a spot plate per mode, inked by CSS, and a composite plate prints the master's indexed image per mode, keeping the true overprint colour where the inks overlap. `texture/plates.sha256` holds their pixel hashes. The six component details are under Components.

**The One House Ink Rule.** Plum is the only colour a control takes, on every surface. A ship never sets a control colour, and no status or spot ink fills a control.

**The Badge Scale Rule.** Status colour prints at badge scale only, always with its glyph square and its word. Failed is the one solid badge, and red never fills a button.

**The Spot Rule.** A ship's spot prints in its mark and its chart series and nowhere else; a ship is told apart by its mark.

**The Flat Where You Read Rule.** A screen never prints behind words, numbers, data or code.

## Typography

**Display Font:** Unbounded (with ui-sans-serif, sans-serif), 300; 400 for the wordmark
**Body Font:** Supreme (with ui-sans-serif, system-ui, sans-serif), 400 and 500
**Reading Font:** Erode (with ui-serif, Georgia, serif), 400, 400 italic, 500 and 600
**Label/Mono Font:** Fragment Mono (with ui-monospace, monospace), 400

**Character:** a wide geometric display face held to light weights for titles, a plain grotesque that runs the interface, a warm serif kept for reading, and a mono for everything counted or quoted. Each face has one job, and no face stands in for another.

The faces load from superthread's own host. Unbounded and Fragment Mono load on any origin; Supreme and Erode load only on Maurice's own origins and localhost, and other origins print those two in system fonts.

### Hierarchy

Each step is a `type-<step>` utility that sets face, size, line, tracking, weight and case together. Steps with a phone value change at 600 px and below.

- **Meta** (Fragment Mono 400, 11/14 px, 0.14em, caps): legends, table heads and the select list's group labels.
- **Instrument** (Supreme 400, 13/20 px): notes, captions, badges and small controls.
- **UI** (Supreme 400, 14/21 px): the interface's body; the base layer sets `body` to 14 px at 1.5.
- **Summary** (Supreme 400, 15/24 px): the text under a section head.
- **Subtitle** (Supreme 500, 18/24 px): dialog titles.
- **Read** (Erode 400, 19/32 px; phone 18/30): the reading page, on a 27.5em measure (about 66 characters).
- **Lede** (Erode 400, 21/33 px; phone 19/31): the sentence under a page title.
- **Title** (Unbounded 300, 22/28 px, -0.02em): card and board titles.
- **Section** (Unbounded 300, 30/34 px, -0.03em): section heads.
- **Page** (Erode 600, 34/40 px, -0.01em; phone 28/34): a reading sheet's heading.
- **Hero** (Unbounded 300, 64/68 px, -0.04em; phone 52/56): a page head's title.
- **Display** (Unbounded 300, 76/80 px, -0.04em): the overview's wordmark line.

The superthread wordmark sets in Unbounded 400 at -0.02em.

**The One Job Rule.** Unbounded sets display lines, Supreme the interface, Erode reading, and Fragment Mono ids, numbers, code and caps legends. A face never does another's job.

**The Lowercase Chrome Rule.** Nav, labels, headings, buttons and every served label, screen-reader text included, are lowercase. Authored titles keep their own casing.

**The Tabular Rule.** Every figure is tabular, from the body rule down; ids and numbers in a table set in mono, with numbers aligned right.

## Layout

Space runs on Tailwind's default 4 px step, used at 4, 8, 12, 16, 24, 32, 48, 64 and 96 px; the frontmatter keys are the Tailwind multipliers (`gap-4` is 16 px). Rows have their own tokens: 56 px on a board (`--spacing-row-board`), 48 px in a table (`--spacing-row-table`) and 32 px for a nav item (`--spacing-row-nav`), each plus its 1 px rule.

- **Sections.** A section head sits inside its full-bleed rule, with 64 px above it and 44 px between the head and its content; panes pad 36 to 48 px.
- **Docs and public pages** print on the stock, with full-bleed rules, a boxed nav and an aside, and no fleet rail.
- **Ship surfaces** print on the deep ground: the fleet rail and the ship's nav flat on it, the working panel raised on it. The board panel is at most 880 px wide and the reading sheet 672 px with 72 px of padding; the reading page keeps a 264 px margin on the ground for its contents and progress.
- **Breakpoints.** At 900 px and below the fleet rail becomes a 48 px bar of 32 px marks above the panel, the current ship boxed, with 12 px of ground on each side of the panel. At 600 px and below the phone type steps and the phone plates apply. The site adds two of its own for its docs shell (1279 px, where the masthead and aside tighten, and 1099 px, where the aside drops below the page); they are the site's, not the tokens'.

**The Full Bleed Rule.** Horizontal rules belong to the page: they run to both window edges, past every column, and no column stops them.

## Elevation & Depth

Surfaces are flat at rest, and depth comes from two things: the deep ground under a ship's working panel, and four raked lifts for layers that float. One light falls from the upper left, so every shadow falls right and down at 3:2 and grows with the lift, with a contact shadow under the edge and square corners.

### Shadow Vocabulary

Each lift is a soft rake plus a contact shadow, in the shadow ink: in light `#020203` at 62 percent with the contact at 30; in dark black at 85 percent with the contact at 40, plus a 1 px `raised-edge` inset. The utilities are `shadow-slip`, `shadow-leaf`, `shadow-sheet` and `shadow-lifted`.

- **Slip** (`box-shadow: 6px 4px 6px -2px <ink>, 1px .7px 1px <contact>`): the lowest lift. No item uses it yet.
- **Leaf** (`box-shadow: 12px 8px 14px -4px <ink>, 2px 1.3px 2px <contact>`): the select list, toasts, and a floating or inset sidebar.
- **Sheet** (`box-shadow: 27px 18px 26px -6px <ink>, 5px 3.4px 5px <contact>`): dialogs, the sheet, the board panel and the reading sheet.
- **Lifted** (`box-shadow: 39px 26px 36px -8px <ink>, 6px 4px 6px <contact>`): the highest lift. No item uses it yet.

### The contact edge

On the stock in light, a raised layer drops its blurred contact and prints it as a screen instead: the shadow ink at 50 percent, 3 px right of the layer and 2 px below it at every lift, clipped to the L outside the layer. It is `texture-contact`, and the layer sets `--contact-lift` to its rake alone (`--elevation-<lift>-rake`). The select list, toasts and the dialog carry it. In dark the screen would print black on key, so it is not drawn: dark layers keep the soft contact and lift by their lighter stock and 1 px edge. A layer that carries the contact edge stays positioned and never clips its own overflow, or the screen disappears.

The board and the reading sheet on the deep ground keep their soft rake and print no screen; a screen of key on the ground would read as a dotted band beside the data.

**The One Light Rule.** Every shadow falls right and down from one upper-left light, and its length grows with the lift. No stock shadow, no centred glow and no backdrop blur.

**The Edge Not Field Rule.** A layer's contact screen covers no more than its own edge would, so no dots fall on the words beyond it.

## Shapes

The form language is square and ruled: `--radius` and every `--radius-*` emit 0px, edges are 1 px, and rules run full bleed. Fields take the `input` ink as their edge, the separator and quiet edges take `border`, a table head's rule takes `foreground`, and the page's full-bleed rules take `rule`.

### Focus

- **Controls** (buttons, tabs, links, rail cells, checkboxes) take a 2 px plum ring at a 2 px offset. The tokens' base layer draws it on `:focus-visible` for links, buttons, summaries, tabs and role buttons.
- **Fields** (input, textarea, input group, the select trigger) own their focus. While the text control holds focus, or when the box is the control as the select trigger is, the box's 1 px edge becomes a 2 px edge drawn inside it (`outline: 2px solid var(--fx)` at `-2px`), and the caret takes the same ink. `--fx` is plum, or the error ink on an invalid field. The text control draws no outline, so the text never moves. An outline, unlike a box shadow, survives forced-colours mode.
- **A button inside a field box** (clear, reveal, a toggle) is a control: it draws its own 2 px ring inside itself and the box stays at 1 px. The input group matches the text control with `:has()`, never `:focus-within`, for this reason.
- **The code patch's copy link** draws its ring 4 px inside itself (`--code-ring-offset: -4px`) in plum's dark value.
- A disabled field never takes focus.

### The boxed current item

The current item, wherever it is (a sidebar entry, the fleet rail's cell, a chosen select option), is boxed: a plum tint fill, a 1 px plum edge, and on the rail and in the sidebar an 8 px plum square, at the rail cell's corner and before the sidebar entry's word.

### Marks and icons

- **Marks** sit on a 16 x 16 grid: a key tile with a 1 px notch cut from each corner, a paper silhouette that names the ship, and one region of the silhouette in the ship's spot as a 1 px checker at 50 percent. The `-dark` drawing swaps tile and silhouette and moves the spot to its dark value; dark chrome and the fleet rail on the deep ground take it. The spot pops at rail and fleet-row sizes (32 to 48 px); at 16 px the mark reads by its silhouette. Superthread's own mark is the home mark, with plum as its spot.
- **Icons** are drawn as whole-pixel squares in the current colour on a 12 px grid: arrow, left, copy, check, chevron, search, close, trash, plus and more (`Icon`). `more` is superthread's own, drawn in `tokens/icons.json` beside the world's set.
- **Status glyphs** are 14 px squares with the glyph knocked out: tick, i, pause, cross and dash (`StatusGlyph`). A field's error message leads with the bang glyph (`FieldErrorGlyph`).

**The Square Rule.** Nothing is rounded: no item carries a literal radius, and every radius token is 0.

**The One Frame Rule.** A focused field shows one frame, its own edge thickened inside the box. A ring outside a field reads as a second frame and its gap as a third.

## Components

Every `@mk` item is a branded skin on base-nova, shadcn's Base UI style: shadcn's API, exports and `data-slot` attributes stay, and the craft lives in the classes. Each brand item's root carries `data-mk="<item>"`. Install with `bunx --bun shadcn@latest add @mk/<item>`; `shadcn init` with the registry's `init` item sets an app up with the style, the tokens, `utils` and the button. Brand items carry the system's rules; pass items (`card`, `collapsible`, `label`, `separator`, `sheet`, `tooltip`, `use-mobile`) are base-nova on the tokens. Each brand item carries at most one texture detail:

| detail    | utility            | item                                                                      | what prints                                                                           |
| --------- | ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| contact   | `texture-contact`  | select list, toast, dialog, dropdown menu, combobox, alert dialog, sonner | light only: the contact shadow as a 50 percent screen                                 |
| mixed     | `texture-mixed`    | checkbox                                                                  | a 12 px plum square at 50 percent inside the box's plum edge                          |
| tab hover | `texture-tabhover` | tabs                                                                      | a 2 px plum bar at 50 percent, previewing the current bar                             |
| row edge  | `texture-rowedge`  | table                                                                     | a 4 px plum strip at 50 percent beside the row under the pointer; solid when selected |
| disabled  | `texture-disabled` | button, input, textarea, input group                                      | the 1 px edge in the input ink at 50 percent; the fill stays flat, the label plain    |
| loading   | `texture-skeleton` | skeleton                                                                  | the first ink at 18.75 percent on whole-pixel bars                                    |

### Buttons

Square, one chromatic ink, quick to answer.

- **Shape:** square corners (0px), a 1 px edge; 40 px tall with 18 px sides at the default size (24, 32 and 48 px for `xs`, `sm` and `lg`, and square icon sizes), Supreme 500 at the UI or instrument step.
- **Primary:** plum fill and edge under the stock label; hover and press take `primary-hover` and `primary-press`, and press adds a 1 px key inset.
- **Secondary / Outline / Ghost:** secondary is key 12 with key words; outline draws its edge in the current colour; ghost has no edge. Their hovers and presses come from the `secondary-*` and `control-*` roles, or `raised-*` on a raised layer.
- **Destructive:** the key ink with the trash glyph before its word (the trash alone on an icon button).
- **Link:** plum words that underline on hover, 4 px below the baseline.
- **Disabled:** a faint fill, the disabled label, no pointer, and the edge screened back to 50 percent.
- **Focus:** the base layer's 2 px plum ring at 2 px. Only the fill, edge and label transition, so the ring snaps on.

### Badges

- **Style:** 30 px tall, square, a 1 px edge, 11 px sides, Supreme 500 at 13 px. shadcn's variants (default, secondary, destructive, outline, ghost, link) keep their meaning on the role inks.
- **Status:** `variant="done" | "running" | "waiting" | "failed" | "queued"` prints the glyph square before the word, and the state's name when given no word. Failed is solid, its glyph in the label ink.

### Fields

- **Style:** input, textarea and the select trigger are 40 px boxes (the textarea grows from three lines) with a 1 px `input` edge on the stock, 12 px sides, Supreme at 14 px. The input group is one box holding a text control with addons and buttons beside it; its controls carry no box of their own.
- **Focus:** the box's edge becomes 2 px inside it in `--fx`, and the caret follows (see Shapes).
- **Error / Disabled:** `aria-invalid` turns the edge and `--fx` to the error ink, and the error message leads with the bang glyph. Disabled prints a faint fill, the disabled label and the edge screened back to 50 percent; a disabled button inside an input group screens itself, never the box.

### Select

The trigger is a field whose box is the control. The list is a raised layer on the leaf lift with the contact edge, 6 px below the trigger; it scrolls inside the popup so the popup never clips its screen. The option under the pointer or the keys takes the raised hover fill, keyboard focus draws the 2 px ring inside the option, the chosen option is boxed in plum, and group labels set at the meta step.

### Checkbox

An 18 px square with the input edge, and a control: its focus ring sits 2 px outside it. Checked fills it with plum under a stock check; mixed (some, not all) keeps the stock fill inside a plum edge and prints its 12 px square at 50 percent.

### Tabs

The default list draws its own 1 px rule; the line list leaves the rule to the page. The current tab is solid: its word in the foreground over a 2 px plum bar that covers the rule. A tab that is not current previews that bar at 50 percent on hover.

### Table

Rows are 48 px (56 on a board) plus a 1 px rule, and the rules sit on the cells. Every first cell takes 16 px of left padding, where the row edge prints. Hover fills no row; a selected row takes the accent fill and a solid strip. Ids and numbers set in mono, numbers align right, and every figure is tabular. A wide table scrolls sideways inside its own container, with no fade at the cut edge.

### Progress

A 12 px track with a 1 px edge holds an 8 px fill at a 1 px inset: flat plum whose leading 24 px is the ramp. A finished bar prints solid. The label and value read below it at 13/20, the value in mono, and the width travels at 240 ms on the brand ease.

### Skeleton

Loading rows: 12 px whole-pixel bars, square and still, in the first ink at 18.75 percent.

### Dialog

A square sheet on the popover fill with a 1 px edge, at most 440 px wide, padded 28 px (24 at the foot), on the sheet lift with the contact edge. Its centring offsets round to whole pixels, so its edges and screen land on the pixel grid at 1x and 2x. The title sets at the subtitle step; the close control is a small ghost button with the close glyph, labelled "close". The scrim beneath has no blur. It fades in and out on its keyframes at the quick duration.

### Toast

Base UI toasts on the popover fill, on the leaf lift with the contact edge. Each kind prints its 14 px status glyph in its own ink: tick for success, i for info and loading, pause for warning, cross for error. The title sets at 14 px Supreme 500 over a 13 px muted description; an action row sits 14 px under the text with 8 px between its buttons, and `ToastList` takes an `actions` slot for more than one. Behind the front toast, each toast peeks 12 px higher per place, moved by whole pixels and never scaled, so every contact screen keeps its 1 px cells. The viewport names itself "notifications".

### Sheet and tooltip

Pass items, and the only motion outside the brand tokens: each keeps base-nova's own. The sheet slides in at 200 ms ease-in-out over a scrim that fades at 150 ms, on the sheet lift with no contact screen. The tooltip prints inverted, in the stock on the first ink, with an arrow cut from a rotated square, and zooms and fades at tw-animate's defaults. Both take `portalProps`, as the dialog, select and toast do, so a layer can render into a container that holds a page's mode.

### Sidebar

The ship's nav, on the deep ground. Everything that prints on the ground (status glyphs, badges, buttons, skeletons, rules) takes the dark palette in both modes, while the ground keeps the page's mode. A nav item is 34 px tall, the 32 px row inside its 1 px edge; its hover is paper 5 over the ground, and the current item is boxed with its 8 px plum square before the word. Below 768 px, `use-mobile`'s breakpoint, it opens as a sheet.

### Fleet rail (signature)

The column of ship marks down the left of every ship surface, on the deep ground: home, then the six ships, each a 32 px mark in a reversed cell. Hover or focus inverts the cell, swaps in the light mark and slides a joined tab out from it at the quick duration, the ship's name over its one-line descriptor; with reduced motion the tab appears in place. The current ship's cell is boxed in plum with its corner square. At 900 px and below the rail is a 48 px bar above the panel, and from the fourth cell on the bar's tab hangs right so it stays on screen. The consumer passes `current`, and optionally the `hrefs`, the ship's `sidebar` and a `markBase`; a ship with no href prints as a disabled cell (`aria-disabled`), its mark at half opacity unless it is the current ship.

### Card, label and separator

Pass items: base-nova's card, label and separator on the tokens, square and ruled like the rest.

### Switch

A square track with the input edge on the stock and an input-ink square inside it. On, the track fills with plum and the square crosses to the right in the stock ink, on the quick duration; hover overprints the fill. The track is a control, with the outside ring. Disabled, the track and its square take the disabled ink on faint stock. The world rejected a screened track: on must read as settled.

### Radio group

An 18 px stock square with the input edge and an outside control ring. Chosen, a plum edge encloses an 8 px plum square; disabled, the edge and square take the disabled ink on faint stock. The grid leaves 12 px between choices.

### Slider

An 8 px ruled stock track holds a flat plum range, with no screen. The 16 px square thumbs keep their outside control ring when the range input takes keyboard focus, and take the accent fill on hover or drag. Vertical tracks mirror the same dimensions; disabled tracks and thumbs use the disabled edge and range ink.

### Toggle

The button's 40 px height, with 32 and 48 px sizes, Supreme 500 at 14 px, and an outside control ring. Default rests without a visible edge; outline draws the input edge. Pressed is boxed in plum on the accent fill. Only fill, edge and label transition, at the instant duration.

### Toggle group

Joined by default at spacing 0, with neighbouring 1 px edges overlapping. The pressed item rises so all four plum edges show, and joined keyboard focus sits inside the item. Positive spacing separates the controls and restores the outside ring; vertical groups share horizontal edges instead.

### Button group

Actions join on shared 1 px edges, horizontally or vertically, and the focused child rises above its neighbours. The text addon is a 40 px secondary-stock box with an input edge and muted UI words. A separator stretches in the input ink.

### Kbd

A 20 px keycap, at least 20 px wide, with a quiet edge on muted stock. Keys set in Fragment Mono at 11 px without caps or tracking. Inside a tooltip they take the inverted stock ink, with an opaque foreground fill and a muted edge; groups leave 4 px between keys.

### Field

Fieldsets keep their upstream parts and orientation variants. Legends set in mono caps, labels and titles at the UI step, and descriptions at the instrument step. Invalid labels take the error ink, disabled labels the disabled ink. A checked choice card is boxed in plum on the accent fill with 16 px padding. Every error message leads with the bang square, including each line of a list; separators carry a meta label on the stock over a 1 px rule.

### Native select

The native select is a flat 40 px field box, or 32 px at the small size, with the input edge and the same inside focus edge as the select trigger. Invalid changes the edge and focus ink together; disabled uses the faint fill and disabled label. A pixel chevron sits at the right without taking pointer input, and options keep native platform semantics.

### Accordion

Rows run between full-width 1 px rules. The 48 px trigger keeps its focus ring inside and turns one pixel chevron on the quick duration. The panel's measured height travels on the same duration and brand ease; its muted UI copy keeps 16 px below it, with links in the house ink.

### Breadcrumb

A wrapping path at the instrument step, with muted links that take foreground ink on hover and the control ring on keyboard focus. The current page prints in foreground ink. Right-facing pixel chevrons separate the items, and a 20 px square holds the more glyph for an omitted stretch.

### Resizable

A 1 px rule separates full-size panels, with an invisible 8 px hit area; hover and drag turn the rule plum. With a handle, a 6 by 16 px grip holds two whole-pixel lines and draws the focus ring inside its box. Without a grip the ring has zero offset around the rule, which has no room for an inside ring. Vertical groups mirror the layout; the installed v4 primitive supplies the hover, active and disabled states.

### Dropdown menu

The menu and its submenus are leaf lists with the contact edge, 6 px from their triggers. Only the inner list scrolls. Rows are 36 px tall, highlight in the raised hover fill and draw keyboard focus inside; destructive stays in the key ink. Checks and 6 px house squares occupy the left indicator column. Group labels and mono shortcuts keep the list hierarchy.

### Combobox

The input is an input group whose field box owns focus; trigger and clear keep their own inside control rings. The popup takes the select's leaf lift and contact edge, with the chosen option boxed on aria-selected and the check at the end. Multiple values print as 24 px secondary chips with named 16 px ghost remove controls; the chips box thickens only while its text control holds focus.

### Command

The cmdk surface stays flat, with a 40 px input group and a scroll list of 36 px rows. cmdk's selected state means the pointer or keys position, so it takes the raised hover fill rather than the chosen box. Group headings use the meta step and shortcuts use Fragment Mono. The palette uses the dialog's sheet and contact edge, with its lowercase accessible title and description inside it.

### Alert dialog

The confirmation is a whole-pixel centred sheet on the popover fill, with a 1 px edge, 28 px padding, the sheet lift and its contact edge. Default width stops at 440 px; small keeps the compact 320 px width. The title uses the subtitle step, media sits in a 40 px secondary square, and house buttons align right 24 px below the explanation. The plain scrim and sheet fade at the quick duration.

### Sonner

Sonner's toast API prints unstyled on the toast's popover fill, 1 px edge and leaf lift with the contact edge, padded 16 px. Every kind uses its 14 px status glyph, including a static i for loading. Titles use UI medium over muted instrument descriptions; actions and cancels take the small default and outline button looks with flat edges. The stack expands by default so toasts never scale. A wrapper carries data-slot and data-mk because sonner drops arbitrary attributes; the viewport label is "notifications".

### Compositions

Blocks (`registry:block`) are the patterns the fleet's apps repeat, built only from the items above. Each installs one file at `components/superthread/blocks/<name>.tsx`, carries `data-mk="<block>"` on its roots, and owns its layout and semantics, not the app's data, routing or copy. Blocks add no texture detail of their own: their lifts, edges and states come from the items inside them. Each block's meta names the apps it serves.

| block              | parts                                                                                                                                           | what it settles                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app-shell          | `AppShell`, `AppShellNav`, `AppShellNavItem`, `AppShellGround`, `AppShellPanel`                                                                 | the fleet rail with the ship's own nav, the deep ground and the working panel on the sheet lift; below 900 px the nav wraps into a row of links          |
| page-header        | `PageHeader`, `PageHeaderBack`, `PageHeaderTitle`, `PageHeaderMeta`, `PageHeaderActions`, `PageHeaderDescription`                               | the title at the section step (hero on `size="page"`), a way back, live meta, actions at the end and a lede under 66ch; no line above the title          |
| section-header     | `Section`, `SectionHeader`, `SectionTitle`, `SectionCount`, `SectionAction`                                                                     | a section named by its title over a foreground rule, a live count and a way onward; 48 px between sections                                               |
| collection-toolbar | `CollectionToolbar`, `ToolbarGroup`, `ToolbarSpacer`, `FilterChip`, `ToolbarCount`, `ViewSwitch`                                                | labelled control groups that wrap, the active filter boxed in plum with its own clear control, a live "n of m" count and a one-pressed view switch       |
| list-rows          | `ListRows`, `ListRow`, `ListRowLead`, `ListRowTitle`, `ListRowAside`, `ListRowMeta`, `ListRowActions`                                           | ruled rows at the board measure; a lead, a title that may link, a mono aside and a meta line; the aside drops under the title at 600 px                  |
| item-cards         | `ItemCards`, `ItemCard`, `ItemCardMedia`, `ItemCardId`, `ItemCardTitle`, `ItemCardMeta`, `ItemCardActions`                                      | small cards in an auto-filling grid; a linked title covers the card with one link, and corner actions stay their own controls                            |
| data-table         | `DataTable`, `SortableHead`, `TableEmpty`                                                                                                       | a named table in the table item's own scroll box, `aria-sort` on the sorted head and an empty row across every column                                    |
| states             | `LoadingState`, `FailedState`, `EmptyState`, `EmptyStateMedia`, `EmptyStateText`, `EmptyStateActions`                                           | loading as skeleton rows at the table measure, failure as an alert with the failed glyph and a retry, empty as words, an optional media slot and actions |
| facts              | `Facts`, `Fact`, `FactLabel`, `FactValue`                                                                                                       | labelled values as a two-column list or a ruled grid of two to four cells, one per line on a phone; numbers and ids in mono                              |
| form-section       | `FormSection`, `FormSectionHeader`, `FormSectionTitle`, `FormSectionDescription`, `FormSectionFields`, `FormSectionFooter`, `FormSectionStatus` | a form named by its heading, the field item's spacing and a ruled save row with a live status                                                            |
| quick-add          | `QuickAdd`                                                                                                                                      | one named field and its add button; it trims, blocks a second add while one is pending, keeps the draft on failure and clears it on success              |
| notice             | `Notice`, `NoticeTitle`, `NoticeDescription`, `NoticeActions`                                                                                   | a flat box on the page's fill where only the status glyph takes colour; a failure is an alert, anything else a status                                    |
| search-palette     | `SearchPalette`, `SearchPaletteTrigger`, `SearchPaletteContent`                                                                                 | one search over the app in the command dialog, opened by its trigger, the modified letter or slash away from text fields                                 |

### Motion

Three durations on one ease. `--duration-instant` (120 ms) times hover and press colour on buttons, badges and tabs, and the select list's entry; `--duration-quick` (180 ms) times the rail's cell and tab, the sidebar's items and the dialog's fade; `--duration-travel` (240 ms) times anything that crosses the page: the progress width, the toast stack and the sidebar's collapse. Every brand transition uses `--ease-brand`, `cubic-bezier(0.22, 1, 0.36, 1)`: changes start fast and ease into place. Transitions name their properties (`transition-[color,background-color,border-color]`), so a focus ring snaps on instead of fading. Motion answers an action or an event; nothing loops, and no screen ever moves. Under `prefers-reduced-motion: reduce` the three durations become 0 and every transition and animation 0.01 ms: states still change, at once.

## Do's and Don'ts

### Do:

- **Do** name roles and utilities, never values: `bg-primary`, `text-muted-foreground`, `border-input`, `type-<step>`, `shadow-<lift>`, `texture-<detail>`. The `.dark` class on `<html>` sets the mode.
- **Do** print every status with its glyph square and its word, through `Badge`'s status variants, `StatusGlyph` or `ToastIcon`.
- **Do** keep focus visible on everything focusable: the 2 px plum ring at 2 px for a control, the 2 px inside edge in `--fx` for a field.
- **Do** lift a raised layer by its size, `shadow-leaf` for lists and toasts and `shadow-sheet` for dialogs and panels, and on the stock add `texture-contact` with its `--elevation-<lift>-rake`.
- **Do** transition named properties at a brand duration on `--ease-brand`, for example `transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand)`.
- **Do** run horizontal rules to both window edges.
- **Do** set ids, numbers and code in Fragment Mono with tabular figures.
- **Do** put a ship's spot only in its mark and its chart series, and chart a series as its line screen.
- **Do** draw a missing icon on the pixel grid and add it to the glyph source.
- **Do** keep chrome and every served label lowercase, with no em dashes.

### Don't:

- **Don't** write a hex value, a `dark:` class or a literal radius in item or app code: the mode and the ink come from the tokens.
- **Don't** round a corner. Every radius is 0.
- **Don't** use `outline-none` or `outline-hidden`: in Tailwind 4 both hide the focus ring. The text control inside a field keeps `outline-0`, because its box draws the focus.
- **Don't** use `transition`, `transition-all` or `transition-colors`, or a duration with no property beside it: each fades the focus ring.
- **Don't** use a stock shadow (`shadow-md`, `shadow-lg`) or a backdrop blur.
- **Don't** print a screen behind words, numbers, data or code, or give a component a second texture detail.
- **Don't** animate a screen, or add grain, noise, glow or misregistered type.
- **Don't** grey a component out with dots: a disabled control screens its edge and nothing else.
- **Don't** colour a control with a ship spot or a status ink, or make a destructive action red: destructive is the key ink with the trash glyph and the word.
- **Don't** print a spot or a status ink as a large flat field.
- **Don't** fade or screen the cut edge of a scrolling table.
- **Don't** take icons from an icon library; every icon and glyph is drawn in whole-pixel squares.
- **Don't** draw a ring outside a field's box or a second frame around it.
