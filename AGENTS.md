# Agent Instructions

- To inspect or verify a running UI, use the global `agent-browser` skill (the pinned `agent-browser` CLI); use Chrome DevTools MCP only for performance traces.

## Repository

This is Maurice's public identity monorepo. `apps/web/` is the live TanStack Start app. `apps/buttons/` builds the mk.wtf/buttons page into the web app's `public/`; its README covers the page and its art pipeline. `apps/share/` is the artifact-share Worker. `packages/superthread/` is the design system: the frozen v1 theme, the v2 tokens and generator, and the versioned `@mk` registry; its README covers usage, scripts and versions. `packages/` is reserved for the superthread design system and shared config presets. `skills/superthread-design/` is the public project skill for the design system.

Read [`apps/web/AGENTS.md`](apps/web/AGENTS.md), [`apps/web/PRODUCT.md`](apps/web/PRODUCT.md), and [`apps/web/DESIGN.md`](apps/web/DESIGN.md) before site work.

Run commands from the repo root. `bun run dev` starts the web app on port 3000, `bun run build` prerenders every page and writes cf's build output, `bun run test` checks the Worker, and `bun run deploy` deploys that output with cf. Cloudflare Workers Builds runs from this root.

After a merge, run `bun run deploy:verify <merged-sha>` to wait for the build-stamped SHAs: the web Worker's `/api/deploy.json` and, when the merge's history touches its paths, the share Worker's `/_health`.

The pre-commit hook runs `bun fmt --staged` with the pinned Bun release, then `bun-canary lint --staged` when the canary is installed (dotfiles supplies it). Lint is still canary-only. `[fmt]` in `bunfig.toml` sets the style and ignored paths. Run `bun fmt` or `bun-canary lint` by hand for the whole repo.

Keep Maurice's voice lowercase and understated. No em dashes in new copy.

Superthread v1 is frozen: www and the share Worker import `packages/superthread/dist/superthread.css`, and `bun run registry` copies the frozen v1 items into `apps/web/public/r/` and never regenerates them. v2 values live in `packages/superthread/tokens/master.json`, vendored from the master world with `bun run --cwd packages/superthread vendor <path to the master world>`, and are never hand-edited. `bun run --cwd packages/superthread build` generates the v2 CSS from them, and `bun run test:clean-room` installs the `@mk` items into a fresh app.

## Dependencies

Upgrades follow the `mk-dependency-upgrades` skill; holds live in `taze.config.ts`.

- Checks: `bun run build` (includes the `bun --check` type-check), `bun run test`, `(cd apps/web && cf deploy --prebuilt --dry-run)`.
- Groups: `@tanstack/react-start` pins `@tanstack/react-router`; `@cloudflare/vite-plugin` pins `wrangler`, `miniflare` and `workerd`; `@modelcontextprotocol/client` and `/server` share one exact version; `react`, `react-dom` and both type packages; the three Tailwind packages.
- Superthread: `packages/superthread` pins its own `shadcn` for the registry tooling, apart from the root copy whose `shadcn/tailwind.css` www imports. After moving its `shadcn`, Base UI or Tailwind pins, run `bun run --cwd packages/superthread check` and `bun run test:clean-room`, adding `-- --record` when the CLI pin moves. The clean-room fixture keeps its own lock, which taze skips; refresh it with `bun run test:clean-room -- --refresh-lock` when web's pins move.
- Smoke test: `bun run dev`, then with `agent-browser` load `/`, `/about`, `/essays`, an essay, `/superthread` and an unknown route, and click between pages. On `main` too, dev logs one image width/height hydration warning and serves an empty-body 404.
