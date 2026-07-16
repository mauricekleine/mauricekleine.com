# mauricekleine.com

Maurice's personal one-pager. Hand-written HTML/CSS/JS, no framework, no build step. That's deliberate: it's a "small internet thing" and the craft is the flex. Don't introduce frameworks, bundlers, or dependencies without asking.

## Run

```sh
bun dev   # bunx serve -p 3000
```

## Files

- `index.html` — the one-pager (hero → currently → side quests → the graveyard → elsewhere → footer)
- `about.html` — longer-form about page, same visual system
- `style.css` — all styling; design tokens as OKLCH custom properties in `:root`
- `stars.js` — the night-sky canvas (star drift, twinkle, cursor parallax, occasional meteor; static frame under prefers-reduced-motion)
- `PRODUCT.md` / `DESIGN.md` — strategy and visual system; read before design changes
- `og.png` — social share card (1200×630); regenerate by opening `og-template.html` at a 1200×630 viewport and screenshotting (it draws the night sky + constellations on a canvas)
- `projects.json`, `social.json`, `theunsettledlife.json` — research/context data about Maurice, not used by the site at runtime

## Voice

All copy is lowercase, builder-to-builder, understated. Canonical voice guide: `../os/brand/voice.md`. Hard rules: no em dashes, no marketing buzzwords, no "X isn't just Y. It's Z" constructions, proof over hype.

## Facts that go stale

- Day job: Lead AI Engineer at Waimakers (since mid-2026)
- Active side quests: Mockly, Fluncle, Hackadam, NonoBench
- The graveyard (ended, shown on purpose): logistics system (sold), Subthread (dissolved), ONESIXTYEIGHT (discontinued), Spinup (spun down into the Waimakers deal)
- Source of truth for bio/brand/projects: the `../os` repo (`index.md` is the entry point)

## Conventions

- Phosphor icons, vendored as inline SVG (no icon font, no CDN)
- Fonts: Bricolage Grotesque + Fragment Mono via Google Fonts
- Keep the Simple Analytics script (`https://api.mauricekleine.com/latest.js`) at the end of body
- Preserve WCAG AA contrast and the reduced-motion fallback in any visual change
