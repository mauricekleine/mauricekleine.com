# Texture

Flat where you read, screened where you look. Framed imagery, site openers, document openers, chapter breaks and video plates print on a **3.5 CSS px** two-ink cosine halftone screen: the first ink runs at `45°` and plum runs at `15°`, with `vivid` light breath in light and dark mode. Legacy `@mk/field-art` prints round dots at a 4 CSS px pitch.

| Place             | What prints                                                       | How                              |
| ----------------- | ----------------------------------------------------------------- | -------------------------------- |
| Document plates   | Framed 3.5 px two-ink proof halftone (key 45° and plum 15°) with vivid light breath | `@mk/plate` or `doc/plate.js` |
| Opener            | Stock-first framed split proof plate beside the page head         | `@mk/plate` (or `scripts/plate.ts`) |
| Figures and video | Screened photography, grids/planes or editorial imagery in two inks | `@mk/plate` or `scripts/plate.ts` |
| Marks             | The ship's spot region at 50 percent                              | The mark SVGs                   |
| Progress edge     | The fill's leading 24 px, from solid to stock                     | `texture-ramp` in `Progress`      |
| Empty and loading | A light wedge of the first ink                                    | Plates; `Skeleton` for rows      |

## The six component details

At most one per component. 50 percent, the half, is the in-between state (a hover previewing the solid current bar, a mixed checkbox, a disabled control); solid is the settled one.

| detail   | utility            | component                         | what prints                                                                                              |
| -------- | ------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| contact  | `texture-contact`  | select list, toast, dialog, paper | light only: the contact shadow as a 50 percent screen, 3 px right of the layer and 2 px below it         |
| mixed    | `texture-mixed`    | checkbox                          | foreground at 50 percent inside the box's foreground edge                                                |
| tabhover | `texture-tabhover` | tabs                              | a 2 px foreground bar at 50 percent, previewing the current bar                                          |
| rowedge  | `texture-rowedge`  | table                             | a 4 px foreground strip at 50 percent at the left edge of the row under the pointer; solid when selected |
| disabled | `texture-disabled` | button and fields                 | the 1 px edge at 50 percent; the fill stays flat and the label plain                                     |
| skeleton | `texture-skeleton` | skeleton                          | the first ink at 18.75 percent on whole-pixel bars                                                       |

The items already carry their detail. A raised layer's screen is an edge, never a field, so no dots fall on the words past it.

## Levels

Component details, progress, the empty wedge and marks print from a 4 × 4 Bayer matrix at 1 CSS px per cell, in steps of 6.25 percent. 50 percent is 8 of its 16 cells (`--texture-b50`) and 18.75 percent is 3 (`--texture-b19`).

## Line screens

A chart series prints in its ship's spot with 1 px lines knocked out to the stock every 4 px, at the ship's own angle: 75 percent spot, 25 percent stock. The angles are orbit 45, quanta 90, trisys 27, constellation 63, artifacts 135 and soliton 117 degrees. 0, 45, 90 and 135 are exact 1 px lines; 27, 63 and 117 are 2:1 pixel steps. The legend swatch repeats the series' spot and line screen.

## Crop marks and plates

Set 10 px corner ticks 16 px outside a contained field. Drop the ticks when the plate meets the window edge.

Static site plates print two binary masks per mode at 2×. CSS sizes them at their native CSS width and height and crops them to fit the box. CSS inks the first and plum plates. The wedge prints an indexed image per mode. Build from `packages/superthread/texture/plates.json` with `packages/superthread/scripts/texture/build.py plates`. The site serves content-hashed files under `/texture/` and `texture/plates.sha256` records their pixel hashes.

## Proof plates (documents and visuals)

Use [@mk/plate](registry.md#plate) (and `scripts/plate.ts` in [superthread-visuals](../../superthread-visuals/SKILL.md) for PNG stills and MP4 video loops) for framed visuals across sites, documents, decks and video: the split `opener`, rare `chapter` breaks and editorial figures. Every plate prints on a 3.5 CSS px cosine dot screen in two inks: key at 45° and plum at 15°. In light mode the drifting `light breath` (default `vivid`) opens dark halftone dots toward white paper and warms the 15° plum plate. In dark mode white dots rest calmly on key stock (~48% max) and brighten upward as the light breath sweeps across, with 15° dark plum printing cleanly over the lit pass. Motion pauses offscreen and in hidden tabs, and holds frame zero under reduced motion and in print.

- **With imagery:** pass a photograph or illustration through `src` (`data-plate-src`) or a child `<img>`. Flat reading stays beside the plate, separated by uniform 1 px `border` hairlines (no plum divider and no corner rectangle on the plate).
- **Without imagery:** skip plates on everyday working sheets (RFCs, audits, dossiers, specs) and use plain `sheet-head` + ruled `section-head` dividers. When a report, opener or chapter break without photography genuinely benefits from a plate, derive a blocky tonal composition from the document's own structure using `planes` (proportional column ratios) or `grid` (density matrix), or supply a custom `draw` callback. Never repeat the same ratios, grid dimensions or seed twice in a document, and never use wavy lines, bouncing orbs or cut-plane horizons.

```html
<div class="chapter">
  <div class="chapter-inner">
    <div class="chapter-copy">
      <div>
        <h2 class="chapter-word">Findings</h2>
        <div class="chapter-bar" aria-hidden="true"></div>
      </div>
      <p class="chapter-cap"><span>What holds</span><span>03</span></p>
    </div>
    <div class="chapter-plate" data-mk="plate" data-plate="grid cols=6 rows=4 seed=19" aria-hidden="true"></div>
  </div>
</div>
```

## Legacy weave

`@mk/weave` remains in the registry for existing installs, but new documents and sites should not use dark island weaves or wavy orb heroes. Prefer `sheet-head` (plain stock) or framed `opener` and `chapter` sections with `@mk/plate`.

## Legacy field art

`@mk/field-art` (4 CSS px dot screen verb fields) remains in the registry and in [superthread-visuals](../../superthread-visuals/SKILL.md#legacy-field-art) for existing installs. New openers, figures, decks and video plates use `@mk/plate` and `superthread-visuals/scripts/plate.ts`.

## What a screen never does

A screen never prints behind words, numbers, data or code: text, table cells, the board's rows or a control's label. The rest of the surface stays flat, which rules out:

- a component greyed out with dots
- noise or random dither
- a soft or blurred glow; the weave's bloom prints in dots
- misregistration on text
- screen motion outside the page’s one live field and the progress fill
