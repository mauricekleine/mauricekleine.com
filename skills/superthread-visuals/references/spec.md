# field specs

Write one line of space-separated `key=value` pairs. A bare spec draws a crest. Values are case-sensitive. An unknown or repeated key, missing value or out-of-range number raises an error.

Coordinates start at the top left. `u` is a fraction of frame width. `v` is a fraction of frame height. A cell is 2 CSS px. Shape height, reach and radial distances use fractions of frame height unless stated. The short side of a wide image still has the same vertical proportions.

## edge

| key | values or closed range | default | meaning |
| --- | --- | --- | --- |
| `edge` | `crest`, `meander`, `terrace`, `merge`, `ellipse`, `mask`. Up to two joined with `+` | `crest` | solid boundary |
| `side` | `bottom`, `top` | `bottom` | solid beneath or above a graph or mask crossing. selects the upper or lower boundary for the knot on a compound contour |
| `base` | .05 to .96 | .74 | graph baseline, merger trunk height or ellipse centre y |
| `at` | 0 to 1 | .50 | crest or ellipse centre x, centre of terrace sequence, or x at which branches finish merging |
| `lift` | −.8 to .8 | .38 | crest height, initial meander amplitude or total terrace rise. negative flips the change |
| `width` | .025 to 1.5 | .20 | crest spread in frame widths |
| `waves` | 1 to 8, integer | 3 | number of meander cycles before it settles |
| `settle` | .08 to 1.4 | .66 | x where the meander straightens. values above 1 let it continue out of frame |
| `phase` | −1 to 1 | .08 | phase of the meander, in turns |
| `steps` | 1 to 8, integer | 3 | number of rises in a terrace |
| `spacing` | .06 to .70 | .20 | distance between terrace steps in frame widths |
| `ease` | .006 to .30 | .055 | width of each eased terrace step or thread jump, in frame widths |
| `branches` | 2 to 10, integer | 5 | number of paths in the fan |
| `fan` | .10 to 1.8 | .82 | vertical spread at the left, before paths come together. the frame can crop the fan |
| `thin` | .004 to .09 | .011 | branch half thickness before the join |
| `trunk` | .012 to .40 | .078 | trunk half thickness after the join |
| `bend` | −.65 to .65 | .10 | vertical offset of the whole fan before the join. positive begins lower |
| `rx` | .04 to .85 | .26 | ellipse horizontal radius in frame widths |
| `ry` | .04 to .80 | .32 | ellipse vertical radius |
| `blend` | .001 to .18 | .024 | smooth union radius when the first edge is `ellipse` or `merge` and there is a second edge |
| `masky` | 0 to 1 | .50 | y hint for picking one crossing from the mask |
| `maskfrom` | 0 to 1 | 0 | first x eligible for a mask thread |

A `crest` is a single sech-squared hump, a `meander` damps to a straight edge and a `terrace` changes height through eased steps. A `merge` joins a fan to one trunk. Inside each gap the reach is limited to 64% of the gap width in light and 39% in dark. On paper the ramps overlap enough to screen the centre while the solid paths hold their edges. An `ellipse` holds a centre and gives a radial field.

Graph pairs add their height changes, using only the first edge's baseline. A graph can take a graph as its second edge. A `merge` or `ellipse` can take a graph, `merge`, or `ellipse` and uses a smooth union. Set a second edge's shape keys with `b.` before the key. The eligible keys are `base at lift width waves settle phase steps ease spacing branches fan thin trunk bend rx ry`. Each keeps the same defaults and ranges. A single ellipse can meet the frame by cropping its solid. Both the solid and the open stock must meet the frame. An enclosed pocket raises an error. A smooth shape prints subcell raster flecks as solid. `b.base` applies only when the first edge is `merge` or `ellipse`.

Use `edge=mask` with `prepare(line, width, height, { mask })` or the React `FieldArt` item’s stable `mask` callback. The callback takes the grid width and height **in cells** and returns a row-major `Uint8Array`. Use 1 for solid and 0 for open stock. At least one solid must meet the frame. The thread takes the oriented crossing nearest `masky` in each column from `maskfrom` onward. Place the knot and its full travel on that crossing. Set `maskfrom` between upstream islands and the first crossing of the focus to hold the thread on the main mass. Two chamfer passes measure signed distance from the whole mask. The engine measures the thread by distance to segments joining adjacent crossings, so steep parts keep their stroke width. Keep the crossing smooth and continuous, and use `mask` alone.

## ramp and ink

| key | values or closed range | default | meaning |
| --- | --- | --- | --- |
| `ramp` | `held`, `steady`, `bet`, `fade` | `fade` | named screen density from the weave |
| `reach` | .035 to 2 | .55 | extent of the ramp out from the solid. graph ramps measure this vertically |
| `tex` | 0 to .85 | 0 | gain for filaments within the ramp |
| `pitch` | 1.5 to 14 | 6.5 | frequency of the continuous texture per frame height |
| `seed` | 0 to 2147483647, integer | 1 | deterministic filament and point seed |
| `levels` | 2 to 6 comma-separated `width:tone` pairs. each width .04 to 1, sum exactly 1. tones 0 to 1 | off | multiplies the ramp by a different tone in each unequal plate |
| `points` | 0 to 1200, integer | 0 | isolated dark points beyond the ramp. a heavily cropped field can have fewer eligible cells |

`held` keeps weight until late. `steady` loses weight evenly. `bet` drops abruptly at 46% of the reach. `fade` eases away. Dark coverage targets a 55% cap and prints at most 8 of 16 ranks. Plum uses the same matrix shifted two cells in x and y. Filaments use three octaves of domain-warped value noise folded into ridges. The ramp gates the noise at both ends. Motion samples the same continuous, untiled texture. Paper prints a lighter filament gain from the same `tex` value.

Palette order is stock, screen, plum, solid. Values come from `packages/superthread/dist/v2/superthread-plain.css`, converted to 8-bit sRGB.

| mode | background | first ink | plum |
| --- | --- | --- | --- |
| light | `--background` #ffffff | `--key` #16181d | `--primary` #aa337a |
| dark | `--ground` #0d0f12 | `--foreground` #e4e4e4 | `--primary` #c074a1 |

Light prints the solid in key. Dark prints it in deep ground. Live stock is transparent, so open cells take the host’s surface in either mode. Standalone dark media uses deep ground for both solid and stock.

## thread and light

| key | values or closed range | default | meaning |
| --- | --- | --- | --- |
| `threadon` | `edge`, `axis`, `ring` | `axis` for merge, otherwise `edge` | trace the edge or its level. `axis` takes the final trunk's centreline on a merge. `ring` takes the first ellipse's radial level in a composite |
| `thread` | .65 to 4 cells | 1.5 | half-width controlling the screened plum seam |
| `knot` | 0 to 1 | .5 | x on a graph or compound contour, progress along a merge axis, or angle in turns clockwise from the right of an ellipse ring |
| `knotr` | 2 to 24 cells | 9 | radius of the knot |
| `spread` | .08 to .85 | .29 | width of the one light around the knot, in frame widths |
| `level` | 0 to 1 | 0 | offset of the thread through the ramp. shifts an axis upward by `level × reach` |
| `jump` | −.8 to .8 | 0 | added thread offset across the turn on a graph |
| `turn` | .08 to .90 | .56 | x at the centre of the thread's eased jump |

For a moving knot, keep the whole travelled part of the thread visible. Aim for one visible thread. Place compound-edge knots on a column with a visible contour. Use `threadon=axis` to trace one path through a branching field.

## motion

| key | values or closed range | default | meaning |
| --- | --- | --- | --- |
| `motion` | `still`, `knot`, `wave`, `filaments` | `still` | choose one moving parameter |
| `duration` | 8 to 24 seconds, integer | 12 | one full cycle. export at 24 fps |
| `travel` | 0 to .28 | .085 | amplitude in the same units as `knot`. a closed ellipse ring makes one full turn when this key is omitted |
| `rest` | 0 to 1 | 0 | cycle fraction at frame zero. .25 shows the first quarter of the loop |
| `drift` | 0 to .50 | .17 | horizontal excursion of the continuous texture in frame heights |

The first edge must be a `crest` for `motion=wave`. Its knot stays on the crest when `knot=at`. `motion=filaments` needs a positive `tex` to show motion. Motion samples time modulo the duration. Export frames 0 through `24 × duration − 1`.

## api

Import `parse`, `prepare`, `paint` and `INKS` from `scripts/field.js`. `prepare(line, width, height, { mask })` takes whole CSS px from 2 to 8192. `paint(art, mode, seconds = 0, out?)` writes one ink index per cell, row-major, with dimensions `art.w` and `art.h`. Reuse a `Uint8Array` of that length for successive frames.

The `@mk/field-art` item’s `mountField(host, mask?)` reads the spec from `data-field-art` and returns a cleanup function. Set or remove `data-field-art-play` to control playback. The host supplies the size, stock and ink tokens. See the [skill](../SKILL.md#render) for how to install and mount the item.
