# Agent Instructions

- To inspect or verify a running UI, use the global `agent-browser` skill (the pinned `agent-browser` CLI); use Chrome DevTools MCP only for performance traces.

## Repository

This is Maurice's public identity monorepo. `apps/web/` is the live TanStack Start app. `packages/superthread/` is the design system (DESIGN.md tokens and generated CSS). `packages/` is reserved for the superthread design system and shared config presets. `skills/` is reserved for public brand skills.

Read [`apps/web/AGENTS.md`](apps/web/AGENTS.md), [`apps/web/PRODUCT.md`](apps/web/PRODUCT.md), and [`apps/web/DESIGN.md`](apps/web/DESIGN.md) before site work.

Run commands from the repo root. `bun run dev` starts the web app on port 3000, `bun run build` prerenders every page and prepares Wrangler's root deploy config, `bun run test` checks the Worker, and `bun run deploy` deploys through the generated config. Cloudflare Workers Builds runs from this root.

After a merge, run `bun run deploy:verify <merged-sha>` to wait for the build-stamped SHA served at `/api/deploy.json`.

Keep Maurice's voice lowercase and understated. No em dashes in new copy.

Superthread is a shadcn theme in `packages/superthread/`. `bun run registry` regenerates its public theme and fleet-rail items in `apps/web/public/r/`. Keep theme values in `packages/superthread/DESIGN.md`.
