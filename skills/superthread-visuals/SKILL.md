---
name: superthread-visuals
description: "Turn a concept into on-brand Superthread art: a screened still, a loop or a live field. Use whenever a Maurice-branded figure, essay, deck, video, ship or site opener needs an image, illustration or visualization of an idea."
---

# superthread visuals

## the rule

1. Fill the frame with the field. Let its solid meet at least one edge.
2. Give the concept a verb and give that verb a smooth edge.
3. Run one named ramp out from the edge. Fade the filaments in and out within it.
4. Run one plum thread along the edge or a level. Set the knot on the thread where the verb turns.
5. Light the field at the knot. Print solid key on paper and deep ground in dark. The engine holds the dark screen back from the edge and caps it at 45%.
6. Print points in dark where the screen runs out. Use them for depth or for a count that means something.
7. Move the knot, the wave or the filaments. Loop in 8 to 24 seconds at 24 fps. The live renderer pauses when the field is offscreen or the tab is hidden, and prints frame zero under reduced motion and in print.

The engine prints round dots at a 4 CSS px pitch, at 45° for the first ink and 15° for plum. Live samples snap to device pixels and the open areas take the scope’s stock. The plum thread has a solid core with a screened knot and bloom. The engine rejects a solid that misses the frame or encloses stock.

## draw a field

1. **Draw the verb.** Find the change that reads in silhouette. Choose which frame edge the solid meets, its direction, scale, ramp and motion. Use a mask path for a one-off edge the primitives cannot draw. Add a primitive only when it serves two concepts. Read the [spec](references/spec.md) for shape keys and units.
2. **Print the ramp.** Choose held for weight, steady for even falloff, bet for a decisive drop or fade for a soft exit. Tune reach with texture off, then bring up `tex` and check paper first for scratches.
3. **Place the thread, knot and points.** Use the edge, a ramp level or a merge axis to carry the thread. Start a mask thread at the main crossing with `maskfrom`. When the count behind the points is unknown, leave them out and ask for the figure. Verify the count at delivery size.
4. **Play the turn.** `travel` uses the same unit as `knot` on each edge. Set `rest` to choose where frame zero lands in the cycle. Watch the full loop and check that the knot stays on the thread at both extremes.
5. **Check the crops.** Compare the light and dark stills at delivery size and at about 240 px. Refit the edge and knot in each required crop, such as square for a card. For an opener, measure desktop and phone separately. Keep the portrait surround and a strip of stock above the band clear through the loop.

## render

Use Bun and ffmpeg. Run from the skill folder or pass absolute paths to the scripts. Save both stills at delivery size. Make a dark loop at the still’s size and a light loop if the field moves on paper.

```sh
spec='edge=crest at=.49 lift=.45 ramp=fade knot=.49 motion=wave travel=.12 rest=.25 duration=16'
bun scripts/render.ts "$spec" light 1200 630 0 field-light.png
bun scripts/render.ts "$spec" dark 1200 630 0 field-dark.png
bun scripts/loop.ts "$spec" dark 1200 630 field-dark.mp4
```

Width and height describe CSS pixels. Append `--dpr 2` to render at two samples per CSS pixel. For `edge=mask`, put a module beside the outputs. Export a callback taking width and height in cells and returning a row-major `Uint8Array`, with 1 for solid and 0 for stock. Append its path and, for a named export, its name to either command. Paths resolve from the working directory. Use an absolute path for a mask elsewhere.

Install `@mk/field-art` for live art. In React, import `FieldArt` from `ui/field-art`, size it in CSS and pass `spec`, an optional stable `mask` callback and `playing` for the one field that moves. In plain HTML, inline `doc/field-art.js` after sized, positioned, overflow-hidden hosts carrying `data-field-art`. Set `data-field-art-play` on the host that moves. For a custom mask, use `mountField(host, mask)` from `lib/field-live`. Keep words beside the art and give an informative field a short accessible name.

## spot failures

- **branch gaps fill in.** Open the fan or thin the branches until the paths read up to the join.
- **branch gaps print white stripes.** Extend a held ramp until the gaps read as screened paper at 240 px.
- **joined centres form a symbol.** Vary the spacing, size and height and give the knot one larger centre.
- **scatter looks like a merge.** Leave separate islands and bend the anchored mass away from their axis.
- **the opener band is faint.** Broaden the ramp or tune filament pitch in the installed crop.
- **levels turn to fog.** Use unequal widths and step down the density. Join the thread with one eased jump.
- **filaments look scratched in.** Check paper first. Lower `tex` or raise `pitch` until the ridges read as one texture.
- **the solid encloses stock.** Move the second edge or adjust `blend` to open the pocket. `b.base` applies when the first edge is `merge` or `ellipse`.
- **the edge looks like an object.** Ease the changes until the verb reads in the silhouette.
- **the knot floats.** Move it onto a visible crossing. Tighten its radius and verify contact through the loop.
