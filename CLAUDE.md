# mauricekleine.com

Maurice's personal one-pager. Hand-written HTML/CSS/JS, no framework, no build step. That's deliberate: it's a "small internet thing" and the craft is the flex. Don't introduce frameworks, bundlers, or dependencies without asking.

## Run & deploy

```sh
bun dev             # bunx serve -p 3000
bun run deploy      # bunx wrangler deploy (Cloudflare Worker, static assets)
```

Hosting: Cloudflare Worker with static assets (`wrangler.jsonc`; `.assetsignore` keeps repo infra out of the served site). `html_handling: auto-trailing-slash` means clean URLs: canonical is `/about`, and `/about.html` redirects there. `_headers` is honored natively (`_redirects` only supports relative URLs on Workers; apex→www is a zone redirect rule). Pushing to main auto-deploys via Workers Builds.

`worker.js` (run first only on `/`, `/about`, `/mcp`) adds markdown content negotiation (`Accept: text/markdown` returns the `.md` mirrors) and a hand-written MCP server at `/mcp` (tools: about_maurice, list_projects, get_uptime, make_a_wish; card at `/.well-known/mcp/server-card.json`). `webmcp.js` exposes in-page tools to browser agents, including `summon_sky_traffic`. If you edit `.well-known/agent-skills/about-maurice/SKILL.md`, recompute its sha256 digest in `.well-known/agent-skills/index.json`.

## Files

- `index.html` — the one-pager (hero → currently → side quests → the graveyard → elsewhere → footer)
- `about.html` — longer-form about page, same visual system
- `style.css` — all styling; design tokens as OKLCH custom properties in `:root`
- `stars.js` — the night-sky canvas (star drift, twinkle, cursor parallax, occasional meteor; static frame under prefers-reduced-motion)
- `texture.js` — dithered neuro-noise nebula (hand-written WebGL shader, no library); film grain lives in style.css as `body::after`
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
