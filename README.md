# mauricekleine.com

Maurice Kleine's public identity monorepo: the site at [mauricekleine.com](https://www.mauricekleine.com), the superthread design system, and its public `superthread-design` skill.

- `apps/web`: the site (TanStack Start on Cloudflare Workers)
- `packages/superthread`: design tokens (`DESIGN.md`) and generated CSS
- `skills/superthread-design/`: the public design-system skill

From the repo root:

```sh
bun install
bun run dev      # the site on port 3000
bun run build    # prerender every page
bun run test     # worker regression tests
bun run deploy   # deploy the build output with cf
```

Workers Builds deploys from the repo root. Site guidance is in `apps/web/AGENTS.md`.
