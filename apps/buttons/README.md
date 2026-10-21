# buttons

[mk.wtf/buttons](https://mk.wtf/buttons) is a page from a 1947 mail-order catalog that never was. Each scene is a pair of plates: the same man doing something by hand, and doing it with the same steel push button. Wide screens show the pair side by side. On phones each scene is one lenticular card that turns from the old model to the new one as the phone tilts, or on a tap.

The plates are clean illustrations. The browser prints them: one WebGL2 canvas per scene adds a CMYK halftone screen, depth parallax that follows the mouse or the phone's tilt, and the button's breathing orange glow. Without WebGL the plain plates show under a CSS dot screen; without JavaScript, phones stack both plates.

## Files

- `src/page.html`: markup and copy. The catalog voice is Title Case with prices and item numbers; the colophon is Maurice's lowercase.
- `src/style.css`: the page.
- `src/main.ts`: scenes, canvas layout, the lenticular card, taps and the cover button.
- `src/print.ts`: the WebGL2 printer (halftone, parallax, glow, lenticular strips).
- `src/tilt.ts`: where the viewer looks from: phone orientation, mouse, or a slow drift.
- `art/`: the exported plates, depth maps, button masks, cover button, icons and link preview; `art/plates.json` describes them.
- `fonts/`: Libre Franklin and Old Standard TT (OFL), Latin subsets.

## Build and dev

From the repo root, `bun run buttons` runs `tools/build.mjs`, then type-checks. The build writes `apps/web/public/buttons.html` with the CSS and JS inline, and copies every plate and font to `apps/web/public/buttons/a/` with a content hash in its name. Both outputs are gitignored. Root `bun run build` and `bun run dev` run it before the web app.

`bun run --cwd apps/buttons dev` serves http://localhost:3001/buttons and rebuilds it, unminified, on every page load.

The web Worker serves the page (`apps/web/src/server-behavior.ts`). mk.wtf serves `/buttons` and `/buttons/a/*` from static assets, and `_headers` caches the hashed files for a year. www.mk.wtf and other spellings of the path get a 301, and mauricekleine.com sends `/buttons` to mk.wtf with a 302.

## Art

Every tool runs from `apps/buttons` through `uv` (`mise exec` supplies it). `tools/art.py` draws with Nano Banana Pro (`gemini-3-pro-image`), with the key from `GEMINI_API_KEY` or `op://Soliton Agents/GEMINI_API_KEY/password`.

1. Draw takes. Each prompt in `art/prompts/` is a whole prompt: a scene composed from `style.txt` and `style-end.txt`, or an edit. Each take is saved as `art/takes/<name>-<n>.png`, with its prompt and references in `<name>-<n>.json`.

   ```sh
   tools/art.py gen art/takes/window-analog --prompt art/prompts/window-analog.txt --ref art/takes/door-analog-1.png
   tools/art.py gen art/takes/window-button --prompt art/prompts/window-button.txt \
     --ref art/takes/window-analog-1.png --ref art/takes/button-1.png
   ```

   `door-analog-1` fixes the man and the style, and every other analog plate takes it as its reference. `button-1` is the canonical button; `panel-high-five` and `panel-good-night` are two-button panels drawn from it. Each button plate edits its scene's chosen analog take, with the button or panel as the second image.

2. Pick takes in `art/plates.json`. It also holds the crop to 1200 by 1500 and, for each scene, the button mask polygons and glow ellipses (`[cx, cy, r]` or `[cx, cy, rx, ry]`) in plate pixels.
3. Run `tools/plate.py export` (plates and their depth maps through `tools/depth.py`, Depth Anything V2), `masks`, `cover` and `og`.
4. Check each scene in both layouts on the dev server.

`art/takes/` is gitignored. On Soliton the raw takes are kept in `~/archive/buttons-takes/`.
