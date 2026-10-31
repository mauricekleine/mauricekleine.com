# marks

A ship's mark is where its colour lives. Every mark is 1-bit, drawn on the same grid, so the fleet reads as one set.

## anatomy

- A 16 x 16 grid. The tile is key, with a 1 px notch cut from each corner.
- A paper silhouette on the tile names the ship.
- One region of the silhouette prints in the ship's spot as a 1 px checker, 50 percent.
- The `-dark` drawing swaps tile and silhouette (paper tile, key silhouette) and moves the spot to its dark value. Dark chrome, and the fleet rail on the deep ground, take the `-dark` drawing.
- The dithered region clears 3:1 or more on its tile in both drawings.

The spot pops at rail and fleet-row sizes (32 to 48 px) and in the chart. At 16 px the mark still reads by its silhouette.

## the marks

| ship          | spot         |
| ------------- | ------------ |
| orbit         | comet blue   |
| quanta        | quark green  |
| trisys        | flare orange |
| constellation | nova violet  |
| artifacts     | manila gold  |
| telemetry     | tachyon teal |
| soliton       | canal indigo |
| superthread   | plum         |

superthread's own mark is the home mark. Its spot is plum, the house ink, and it sits in the fleet rail's home cell and serves as the site's favicon. The spot values are in [colour](colour.md).

The superthread wordmark sets in Unbounded 400.

## files and URLs

The marks are plain SVG, served to any origin and cached for a day:

```
https://superthread.mauricekleine.com/marks/<id>/<id>.svg
https://superthread.mauricekleine.com/marks/<id>/<id>-dark.svg
```

`FleetRail` reads them from its `markBase` prop, which defaults to `https://superthread.mauricekleine.com/marks`. A surface that hosts its own copies passes its own folder. `@mk/fleet` (`lib/fleet.ts`) lists the ships in rail order, each with its id, name, rail membership, line-screen angle and mark file names. A ship with `"rail": false` in the manifest, soliton today, keeps its mark for other places and has no rail cell.

[Download marks at /icons](https://superthread.mauricekleine.com/icons): the home mark and every current ship, in both chromes. Each drawing has its SVG and transparent PNGs at 16, 32, 48, 64, 128, 256, 512 and 1024 px. PNGs are exact integer upscales of the 16 px grid, with hard edges and transparent corner notches. Plain download links work without JavaScript. A per-mark zip includes both SVGs and every PNG size; the whole-set zip includes every current mark.

```
https://superthread.mauricekleine.com/marks/<id>/png/<id>-<light|dark>-<size>.png
https://superthread.mauricekleine.com/marks/<id>/<id>.zip
https://superthread.mauricekleine.com/marks/superthread-icons.zip
```

In the mauricekleine.com repo, `packages/superthread/marks/fleet.json` owns fleet membership and new star marks. `apps/superthread/public/marks/` keeps the original master marks as byte copies alongside generated marks. `PROVENANCE.json` records the SVGs' sources and sha256. The site's build and dev generate PNGs and zips with no extra dependency, embedding PNG source metadata and recording derived files in `DOWNLOADS.json`. These files are build output and inherit the marks' CORS and one-day cache headers.

## icons

Interface icons are pixel icons too, from `@mk/glyphs`, drawn as whole-pixel squares:

- `Icon` (12-cell grid): arrow, left, copy, check, chevron, search, close, trash, plus, more.
- `StatusGlyph` (14-cell grid): tick, i, pause, cross and dash, one per status.
- `FieldErrorGlyph`: bang, which leads a field's error message.

An icon is decorative until it gets an `aria-label`. A surface uses these icons and adds none of its own: a missing icon is drawn the same way, whole pixels on the 12-cell grid, and lands in the glyph source so every app gets it.

## adding a ship or redrawing a mark

Run `bun run --cwd packages/superthread marks new <id> [--target soliton|cloudflare] [--url URL|none]` in the mauricekleine.com repo. It allocates a distinct spot and line-screen angle, draws a star in both chromes, and updates the manifest, fleet item and provenance. A star is one dot on a screened hue tile until its glyph is drawn.

`marks check` verifies the 16 px geometry, contrast, colour separation and provenance. `marks sheet --out <file.html>` renders every mark at 16, 32 and 48 px in both chromes.

Theme values and original glyphs still come from the master world through `vendor`. A redrawn mark uses the same grid and checks, with its source recorded in provenance. A changed fleet item ships as the next registry version.
