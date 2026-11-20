# texture

Flat where you read, screened where you look. Print a tint through the 4 × 4 Bayer matrix at a 2 CSS px grain in every field, at every width. Live canvases snap cells to device pixels. Static plates print at native CSS size with nearest-neighbour sampling. Component details and chart line screens keep 1 px tiles.

| place             | what prints                                                       | how                              |
| ----------------- | ----------------------------------------------------------------- | -------------------------------- |
| opener            | one band in the first ink and plum                               | two masks; the www sky is live   |
| figures           | reading figures in two inks                                      | two masks                        |
| marks             | the ship's spot region at 50 percent                             | the mark SVGs                   |
| progress edge     | the fill's leading 24 px, from solid to stock                     | `texture-ramp` in `Progress`      |
| empty and loading | a light wedge of the first ink                                   | plates; `Skeleton` for rows      |
| weave             | a solid breaking into a screen alongside words                   | `@mk/weave`                     |

## the six component details

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

## levels

Screens come from a 4 x 4 bayer matrix, which prints in steps of 6.25 percent. 50 percent is 8 of its 16 cells (`--texture-b50`) and 18.75 percent is 3 (`--texture-b19`).

## line screens

A chart series prints in its ship's spot with 1 px lines knocked out to the stock every 4 px, at the ship's own angle: 75 percent spot, 25 percent stock. The angles are orbit 45, quanta 90, trisys 27, constellation 63, artifacts 135 and soliton 117 degrees. 0, 45, 90 and 135 are exact 1 px lines; 27, 63 and 117 are 2:1 pixel steps. The legend swatch repeats the series' spot and line screen.

## crop marks and plates

Set 10 px corner ticks 16 px outside a contained field. Drop the ticks when the weave meets the window edge.

Openers and figures print two binary masks per mode. CSS inks the first and plum plates. The wedge prints an indexed image per mode. Build from `packages/superthread/texture/plates.json` with `packages/superthread/scripts/texture/build.py plates`. The site serves content-hashed files under `/texture/` and `texture/plates.sha256` records their pixel hashes.

## weave

Use [@mk/weave](registry.md#weave) for a hero or a band. Put words on the flat solid or on the stock. A weave prints in the mode of its own scope, so set it beside a `.dark` block, never inside one: on a light page its solid is key and its screen thins into the paper. Keep decorative texture inside the field, with ordered cells and clean type. In dark the thread and knot bloom with screened plum.

| spec key | meaning |
| -------- | ------- |
| `run=right\|down`, `phone=down` | run beside or below the solid. `phone` overrides the run at 600 px and below |
| `fray=.06` or `fray=arch apex=.24 sides=.45` | the break as a fraction of the run. an arch sets the middle and the ends |
| `bow=6`, `waves=2 amp=3`, `wobble=2 period=24 seed=11` | mirrored offsets in cells. bow leans at the middle, waves add lobes, and wobble is capped at two cells |
| `ramp=held\|steady\|bet\|fade` | choose held for facts and findings, steady for plans and principles, bet for hypotheses and proposals, fade for notes and appendix heads |
| `thread=4 strength=1` | the plum seam's half-width in cells and its strength. zero width hides it. in `bet` the thread runs at the ramp's break |
| `knot=.36 knotr=13 live` | a knot at a fraction of the breadth with radius in cells. bare `live` sets it in motion |

One light shades the screen beyond a short hold past the fray. In light it thins key ink on paper. In dark it lights the foreground screen up to 55 percent while the solid prints in the deep ground. The plum plate uses the matrix shifted two cells along both axes.

Put at most one knot on a page, in the hero. Only a hero or a video can print a live weave. It pauses offscreen and in a hidden tab, and prints a still frame under reduced motion and in print. The www sky follows the same motion rule. App surfaces keep their fields still. Use the same spec for a page, a still plate or each frame of a video.

## what a screen never does

A screen never prints behind words, numbers, data or code: text, table cells, the board's rows or a control's label. The rest of the surface stays flat, which rules out:

- a component greyed out with dots
- noise or random dither
- a soft or blurred glow; the weave's bloom prints in screened cells
- misregistration on text
- motion outside the one live weave
