# mauricekleine.com

This is Maurice's public identity monorepo. `apps/site/` contains the live site and its build and test tools. `packages/` is reserved for the upcoming superthread design system and shared config presets. `skills/` is reserved for public brand skills.

The site-specific instructions, product brief, and design system live in `apps/site/CLAUDE.md`, `apps/site/PRODUCT.md`, and `apps/site/DESIGN.md`. Read them before site work.

Run commands from the repo root. `bun run dev` serves `apps/site` on port 3000, `bun run test` checks the Worker, and `bun run deploy` deploys through the root `wrangler.jsonc`. Cloudflare Workers Builds deploys from this root.

Keep Maurice's voice lowercase and understated. No em dashes in any copy.
