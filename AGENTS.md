# Agent Instructions

- To inspect or verify a running UI, use the global `agent-browser` skill (the pinned `agent-browser` CLI); use Chrome DevTools MCP only for performance traces.

## Repository

This is Maurice's public identity monorepo. `apps/web/` is the live TanStack Start app. `apps/buttons/` builds the mk.wtf/buttons page into the web app's `public/`; its README covers the page and its art pipeline. `apps/share/` is the artifact-share Worker. `apps/superthread/` is the superthread.mauricekleine.com site, which renders the v2 items and serves the `@mk` registry; read its [`AGENTS.md`](apps/superthread/AGENTS.md) before working there. `packages/superthread/` is the design system: the frozen v1 theme, the v2 tokens and generator, and the versioned `@mk` registry; its README covers usage, scripts and versions. `packages/` is reserved for the superthread design system and shared config presets. `skills/superthread-design/` is the public project skill for the design system.

Read [`apps/web/AGENTS.md`](apps/web/AGENTS.md), [`apps/web/PRODUCT.md`](apps/web/PRODUCT.md), and [`apps/web/DESIGN.md`](apps/web/DESIGN.md) before work on www.

Run commands from the repo root. `bun run dev` starts the web app on port 3000, `bun run build` prerenders every page and writes cf's build output, `bun run test` runs the tests of the superthread package and the web, share and superthread apps, and `bun run deploy` deploys that output with cf. Cloudflare Workers Builds runs from this root. `bun run dev:superthread` starts the superthread site on port 3001, `bun run build:superthread` builds it with the registry, and `bun run deploy:superthread` deploys it with cf.

After a merge, run `bun run deploy:verify <merged-sha>` to wait for the build-stamped SHAs: the web Worker's `/api/deploy.json` and, when the merge's history touches their paths, the share Worker's `/_health` and the superthread site's `/api/deploy.json`.

The pre-commit hook runs `bun fmt --staged` with the pinned Bun release, then `bun-canary lint --staged` when the canary is installed (dotfiles supplies it). Lint is still canary-only. `[fmt]` in `bunfig.toml` sets the style and ignored paths. Run `bun fmt` or `bun-canary lint` by hand for the whole repo.

Keep Maurice's voice lowercase and understated. No em dashes in new copy.

www and the share Worker print on v2: www's `site.css` imports `packages/superthread/dist/v2/superthread.css` and uses the items in place through its `@/components/superthread` alias, and the pin page inlines `superthread-plain.css`. The frozen v1 CSS at `packages/superthread/dist/superthread.css` stays pinned for installs that still carry it, and `apps/web/public/fonts/` serves their fonts. The `@mk` v2 registry and fleet marks are served by superthread.mauricekleine.com. v2 theme values live in `packages/superthread/tokens/master.json`, vendored from the master world with `bun run --cwd packages/superthread vendor <path to the master world>`, and are never hand-edited. `bun run --cwd packages/superthread build` generates the v2 CSS from them, and `bun run test:clean-room` installs the `@mk` items into a fresh app. `packages/superthread/DESIGN.md` documents the v2 values. Fleet membership and new star marks live in `packages/superthread/marks/fleet.json`; `bun run marks new <id>` generates them and `bun run marks check` verifies them.

## Dependencies

Upgrades follow the `mk-dependency-upgrades` skill; holds live in `taze.config.ts`.

- Checks: `bun run build` (includes the `bun --check` type-check), `bun run test`, `(cd apps/web && cf deploy --prebuilt --dry-run)`. `apps/superthread` keeps web's pins and `packages/superthread`'s `shadcn`, so each moves in both places; also run `bun run build:superthread` and `(cd apps/superthread && cf deploy --prebuilt --dry-run)`.
- Groups: `@tanstack/react-start` pins `@tanstack/react-router`; `@cloudflare/vite-plugin` pins `wrangler`, `miniflare` and `workerd`; `@modelcontextprotocol/client` and `/server` share one exact version; `react`, `react-dom` and both type packages; the three Tailwind packages.
- Superthread: `packages/superthread` pins its own `shadcn` for the registry tooling, apart from the root copy whose `shadcn/tailwind.css` www imports. After moving its `shadcn`, Base UI or Tailwind pins, run `bun run --cwd packages/superthread check` and `bun run test:clean-room`, adding `-- --record` when the CLI pin moves. The clean-room fixture keeps its own lock, which taze skips; refresh it with `bun run test:clean-room -- --refresh-lock` when web's pins move.
- Smoke test: `bun run dev`, then with `agent-browser` load `/`, `/about`, `/essays`, an essay and an unknown route, and click between pages. On `main` too, dev logs Simple Analytics' localhost warning and Turnstile's domain error (110200) from the subscribe form, and serves an empty-body 404.
