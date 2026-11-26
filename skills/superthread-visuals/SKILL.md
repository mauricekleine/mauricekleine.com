---
name: superthread-visuals
description: "Turn a photograph, illustration, or structural idea into an on-brand Superthread plate: a 3.5 px two-ink proof halftone still, light-breath MP4 loop, or live @mk/plate canvas. Use whenever a Maurice-branded figure, opener, chapter break, essay, deck, video, or site needs framed imagery or tonal plates."
---

# Superthread visuals

## The proof halftone language

Every Superthread visual plate prints on a **3.5 CSS px** two-ink cosine halftone screen:

- **Screen angles:** key ink at `45°` and plum house ink at `15°`.
- **Square, hairline frames:** `0px` corners and uniform `1px solid var(--border)` hairlines (`#e7e7e7` light, `#37373a` dark). No plum vertical divider, no corner rectangle stamped on the image, and no dark-island slab on light stock.
- **Light mode:** key `#16181d` and plum `#aa337a` dots printed on white stock `#ffffff`. A drifting **light breath** (default `vivid`) sweeps gently across the plate, opening dark dots toward white paper and warming the `15°` plum pass.
- **Dark mode:** calm white `#e7e7e7` dots on `#16181d` key stock, illuminated upward as the light breath sweeps across, with `15°` dark plum `#c074a1` printing cleanly over the lit pass. Real imagery (`--src` / `data-plate-src`) defaults to positive polarity (bright highlights print as white dots, resting up to ~52% and lifting to ~88% under vivid breath), while abstract `planes` and `grid` default to negative ink mapping (~48% max at rest).
- **Motion discipline:** live plates pause when offscreen or in hidden tabs, and hold frame zero under `prefers-reduced-motion: reduce` and in print. Text, numbers, data, and code stay flat beside the plate, never printed over dots.

## Choose the subject

1. **Real imagery first (`--src` / `data-plate-src`).** Pass a photograph, portrait, screenshot, or editorial illustration through the proof screen. The renderer center-crops to fill the frame and maps luminance to the `45°` key plate and midtone/saturation warmth to the `15°` plum plate.
2. **Structure-driven no-photo plates (`planes` or `grid`).** When a report, deck, video plate, or opener has no photograph, derive a blocky tonal composition from the piece's own structure:
   - `planes`: proportional vertical bands (`ratios=42,24,18,16`) with a stepped tonal shelf (`shelf=0.56`) and a crisp light window. Vary `ratios`, `seed`, `shelf`, and `flip` so no two plates in a piece repeat. Set `cutout=0` on narrow horizontal strips (`<= 160 px` tall) and wide horizontal video plates so the cutout rectangle never reads like a redacted placeholder.
   - `grid`: an architectural density matrix (`cols=6 rows=4`) with diagonal tonal weight and per-cell shading. Vary `cols`, `rows`, `seed`, and `flip`.
   - Never use wavy lines, bouncing orbs, cut-plane horizons, or one canned pattern cloned across documents.
3. **Skip plates on working sheets.** Everyday RFCs, audits, dossiers, specs, and comparisons open flat on stock (`sheet-head`) with ruled `section-head` dividers and zero decorative plates.

## Spec keys

Pass a spec string to `<Plate spec="..." />`, `data-plate="..."`, or `scripts/plate.ts --spec "..."`:

| Key | Applies to | Default | Meaning |
| --- | --- | --- | --- |
| `planes` / `grid` | both | `planes` | Geometry kind |
| `ratios=a,b,c,...` | `planes` | `42,24,18,16` | Proportional column weights (at least 2 positive numbers) |
| `shelf=0..0.9` | `planes` | `0.56` | Vertical start of the stepped shadow shelf (`0` disables it) |
| `cutout=0\|1` | `planes` | `1` | Negative-space cutout rectangle (`0` or `false` skips it on narrow chapter strips) |
| `positive=0\|1` | both | auto | Dark-mode dot polarity (`1` for real photos by default, `0` for `planes`/`grid`) |
| `cols=2..16` | `grid` | `6` | Matrix columns |
| `rows=2..12` | `grid` | `4` | Matrix rows |
| `seed=<int>` | both | `1` | Deterministic tonal variation seed |
| `flip` | both | off | Mirror composition horizontally |
| `breath=<level>` | both | `vivid` | Light breath strength: `vivid`, `balanced`, `gentle`, or `off` |
| `still` | both | off | Alias for `breath=off` |
| `pitch=2..8` | both | `3.5` | CSS dot pitch in pixels |

## Render stills and MP4 loops

Use `scripts/plate.ts` with Bun and ffmpeg (no npm dependencies). Run from the skill folder or pass the absolute path to `scripts/plate.ts`.

```sh
# 1. Proportional planes still (light and dark)
bun scripts/plate.ts --spec "planes ratios=42,24,18,16 seed=7" --mode light --width 1200 --height 630 --out planes-light.png
bun scripts/plate.ts --spec "planes ratios=42,24,18,16 seed=7" --mode dark --width 1200 --height 630 --out planes-dark.png

# 2. Screen a photograph or illustration at 2x DPR
bun scripts/plate.ts --src ./portrait.png --mode light --width 800 --height 800 --dpr 2 --out portrait-light.png
bun scripts/plate.ts --src ./portrait.png --mode dark --width 800 --height 800 --dpr 2 --out portrait-dark.png

# 3. Animated vivid light-breath MP4 loop (for Remotion / mk-motion / decks)
bun scripts/plate.ts --spec "grid cols=6 rows=4 seed=19" --mode dark --width 1200 --height 630 --breath vivid --duration 8 --fps 24 --out plate-loop.mp4
bun scripts/plate.ts --src ./portrait.png --mode light --width 1920 --height 1080 --breath vivid --duration 8 --fps 30 --out video-plate.mp4
```

Key flags:

- `--out <file.png|file.mp4>`: extension picks still PNG vs H.264 `yuv420p` MP4 loop.
- `--src <path>`: center-crops any image ffmpeg can read (transparent cutouts composite cleanly over white stock).
- `--spec "<spec>"`: `planes` or `grid` geometry when `--src` is omitted.
- `--mode <light|dark>`: light (`#ffffff` stock, `#16181d` key, `#aa337a` plum) or dark (`#16181d` stock, `#e7e7e7` white, `#c074a1` plum).
- `--width`, `--height`, `--dpr`: CSS dimensions and pixel ratio multiplier (default `1200 x 630`, `dpr 1`).
- `--breath <vivid|balanced|gentle|off>` and `--still`: control light breath strength (default `vivid`).
- `--positive` / `--negative`: override dark-mode polarity (defaults to positive for `--src`, negative for `--spec`).
- `--time <sec>`, `--phase <rad>`: sample a specific breath moment in a PNG still.
- `--duration <sec>`, `--fps <n>`, `--crf <n>`: MP4 loop timing and quality (defaults: cycle length `8s` for `vivid`, `9.5s` for `balanced`, `11s` for `gentle`; `24` fps; CRF `14`). Match `--duration` to the exact breath period (or an integer multiple) so loops wrap with zero seam. When embedding a data-URI MP4 loop inside a self-contained HTML artifact, use `--crf 26 --fps 20` to keep file size lean while preserving crisp halftone dots.

## Live web and document plates

Install `@mk/plate` beside the Superthread v2 tokens.

- **React:** import `Plate` from `@/components/superthread/ui/plate`, size the element in CSS, and pass `src` for an image, `spec` for `planes`/`grid`, or a stable `draw` callback for custom canvas tonal input. Pass `breath="vivid"` (default), `breath="balanced"`, `breath="gentle"`, or `still` to hold frame zero.
- **Plain HTML documents:** add `data-mk="plate"` plus `data-plate="<spec>"` or `data-plate-src="<url>"` (or wrap a child `<img>`) on a sized container, then inline `doc/plate.js` in a classic script after the sections. Set `data-plate-breath` or `data-plate-still` as needed.

Always inspect both light and dark renders at delivery size (and mobile width for responsive openers) before shipping.

## Legacy field art

Older 4 CSS px `@mk/field-art` verb fields (wavy/knot filaments and edge masks) remain in `scripts/render.ts`, `scripts/loop.ts`, and [references/spec.md](references/spec.md) solely to maintain existing installs that already use them. For all new openers, chapter breaks, figures, decks, and video plates, use `@mk/plate` and `scripts/plate.ts` above.
