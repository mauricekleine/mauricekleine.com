# texture

Flat where you read, screened where you look. A screen is a 1-bit pattern that stands in for a tint, and a flat tint equals the linear-light average of its screen, so the two read as the same ink. CSS inks every screen through a mask, so the mode and the house ink re-ink it with no new images. Tiles are whole pixels: crisp at 1x, 2x and 3x, uneven at a fractional zoom.

A screen sits at an edge, a track, a shadow or a state, beside the content it serves.

## the five places

| place             | what prints                                                                                     | how                                   |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| opener            | a two-plate halftone band inside crop marks: key at 45 degrees, plum at 74, the title knocked out to bare stock | plates; the overview's opener and a slim band in each page head |
| figures           | reading figures on their own two screens, and chart series as line screens                     | plates; `texture-line-<ship>`        |
| marks             | the ship's spot region as a 1 px checker at 50 percent                                          | the mark SVGs                         |
| progress edge     | the fill's leading 24 px, a bayer ramp from solid to the stock                                  | `texture-ramp`, inside `Progress`     |
| empty and loading | a light key wedge, which the matrix prints as three steps: 6.25, 12.5 and 18.75 percent         | plates; `Skeleton` for loading rows   |

## the six component details

At most one per component. 50 percent, the half, is the in-between state (a hover previewing the solid current bar, a mixed checkbox, a disabled control); solid is the settled one.

| detail    | utility             | component                    | what prints                                                                                     |
| --------- | ------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| contact   | `texture-contact`   | select list, toast, dialog   | light only: the contact shadow as a 50 percent screen, 3 px right of the layer and 2 px below it |
| mixed     | `texture-mixed`     | checkbox                     | plum at 50 percent inside the box's plum edge                                                   |
| tabhover  | `texture-tabhover`  | tabs                         | a 2 px plum bar at 50 percent, previewing the current bar                                       |
| rowedge   | `texture-rowedge`   | table                        | a 4 px plum strip at 50 percent at the left edge of the row under the pointer; solid when selected |
| disabled  | `texture-disabled`  | button and fields            | the 1 px edge at 50 percent; the fill stays flat and the label plain                            |
| skeleton  | `texture-skeleton`  | skeleton                     | the first ink at 18.75 percent on whole-pixel bars                                              |

The items already carry their detail. A raised layer's screen is an edge, never a field, so no dots fall on the words past it.

## levels

Screens come from a 4 x 4 bayer matrix, which prints in steps of 6.25 percent. 50 percent is 8 of its 16 cells (`--texture-b50`) and 18.75 percent is 3 (`--texture-b19`).

## line screens

A chart series prints in its ship's spot with 1 px lines knocked out to the stock every 4 px, at the ship's own angle: 75 percent spot, 25 percent stock. The angles are orbit 45, quanta 90, trisys 27, constellation 63, artifacts 135 and soliton 117 degrees. 0, 45, 90 and 135 are exact 1 px lines; 27, 63 and 117 are 2:1 pixel steps. The legend swatch repeats the series' spot and line screen.

## crop marks

Every screened field (an opener, a figure, the empty wedge) gets 10 px corner ticks, 16 px outside the field.

## plates

The opener, the figures and the empty wedge print from plates: one 1-bit image per ink, shipped as a mask and painted nearest neighbour, so it stays 1-bit at 2x. In dark, paper-white never prints solid: at most 78 percent in an opener and 72 in a figure.

`packages/superthread/scripts/texture/build.py plates` generates them from the spec in `packages/superthread/texture/plates.json`, with the pixel hashes in `texture/plates.sha256`. The site serves its plates under `/texture/`, named by content hash, so a plate's URL changes with the plate. A surface that needs its own opener or wedge generates plates with the same script.

## what a screen never does

A screen never prints behind words, numbers, data or code: text, table cells, the board's rows or a control's label. The rest of the surface stays flat, which rules out:

- a component greyed out with dots
- grain or noise
- glow
- misregistration on text
- animation
