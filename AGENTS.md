# Agent Instructions

- To inspect or verify a running UI, use the global `agent-browser` skill (the pinned `agent-browser` CLI); use Chrome DevTools MCP only for performance traces.

## Repository

This is Maurice's public identity monorepo. `apps/web/` is the live TanStack Start app. `apps/buttons/` builds the mk.wtf/buttons page into the web app's `public/`; its README covers the page and its art pipeline. `apps/share/` is the artifact-share Worker. `packages/superthread/` is the design system (DESIGN.md tokens and generated CSS). `packages/` is reserved for the superthread design system and shared config presets. `skills/superthread-design/` is the public project skill for the design system.

Read [`apps/web/AGENTS.md`](apps/web/AGENTS.md), [`apps/web/PRODUCT.md`](apps/web/PRODUCT.md), and [`apps/web/DESIGN.md`](apps/web/DESIGN.md) before site work.

Run commands from the repo root. `bun run dev` starts the web app on port 3000, `bun run build` prerenders every page and writes cf's build output, `bun run test` checks the Worker, and `bun run deploy` deploys that output with cf. Cloudflare Workers Builds runs from this root.

After a merge, run `bun run deploy:verify <merged-sha>` to wait for the build-stamped SHAs: the web Worker's `/api/deploy.json` and, when the merge's history touches its paths, the share Worker's `/_health`.

The pre-commit hook runs `bun fmt --staged` with the pinned Bun release, then `bun-canary lint --staged` when the canary is installed (dotfiles supplies it). Lint is still canary-only. `[fmt]` in `bunfig.toml` sets the style and ignored paths. Run `bun fmt` or `bun-canary lint` by hand for the whole repo.

Keep Maurice's voice lowercase and understated. No em dashes in new copy.

Superthread is a shadcn theme in `packages/superthread/`. `bun run registry` regenerates its public theme and fleet-rail items in `apps/web/public/r/`. Keep theme values in `packages/superthread/DESIGN.md`.

## Dependencies

Upgrades follow the `mk-dependency-upgrades` skill; holds live in `taze.config.ts`.

- Checks: `bun run build` (includes the `bun --check` type-check), `bun run test`, `(cd apps/web && cf deploy --prebuilt --dry-run)`.
- Groups: `@tanstack/react-start` pins `@tanstack/react-router`; `@cloudflare/vite-plugin` pins `wrangler`, `miniflare` and `workerd`; `@modelcontextprotocol/client` and `/server` share one exact version; `react`, `react-dom` and both type packages; the three Tailwind packages.
- Smoke test: `bun run dev`, then with `agent-browser` load `/`, `/about`, `/essays`, an essay, `/superthread` and an unknown route, and click between pages. On `main` too, dev logs one image width/height hydration warning and serves an empty-body 404.
