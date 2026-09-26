# mauricekleine.com

Maurice Kleine's public identity monorepo. The hand-written site lives in `apps/site`; `packages/` is reserved for the superthread design system and shared config presets, and `skills/` for public brand skills.

From the repo root:

```sh
bun install
bun run dev      # serve apps/site on port 3000
bun run test     # worker regression tests
bun run deploy   # deploy through the root wrangler.jsonc
```

Workers Builds deploys from the repo root. Site guidance is in `apps/site/CLAUDE.md`.
