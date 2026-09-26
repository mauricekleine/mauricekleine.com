# superthread

One thread through the things Maurice builds. `DESIGN.md` is the token source.
`bun run build` here regenerates `dist/tokens.css`, `dist/theme.css`, and
`dist/tokens.json`. The registry source lives in `registry/` and the public
specimen lives at `/superthread`.

## Install

In a React app configured for Tailwind CSS v4 and the shadcn CLI:

```sh
npx shadcn@latest add https://www.mauricekleine.com/r/superthread.json
npx shadcn@latest add https://www.mauricekleine.com/r/button.json
```

The foundation places CSS and font guidance in
`components/superthread/styles/` and the `cn` helper in
`components/superthread/lib/`. Import `superthread.css` once in the app's CSS
entry, after Tailwind's theme and utilities. The CSS contains the two modes and
the Tailwind v4 theme. Set `data-mode="paper"` on an ancestor to use paper.
Self-host the fonts listed in `fonts.md`.

Each UI item includes the foundation files so a direct local or URL install
works before the site is deployed. Existing foundation files are skipped by
the CLI unless you choose to overwrite them. The installed component source
stays in your app and can be edited there.

## Add a component

1. Add `registry/ui/<name>.tsx`. Use only role tokens from the generated CSS.
2. Add a `registry:ui` item to `registry.json` with pinned dependencies and
   the five foundation files included in the other component items.
3. Run `bun run registry` at the repo root, then `bun run test` and `bun run build`.
4. Add every variant to the specimen route.

The root build regenerates `/r/*.json` before Vite copies the files into the
public Worker assets.
