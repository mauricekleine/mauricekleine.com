# superthread

A shadcn theme for Maurice's fleet. `DESIGN.md` owns the colors, fonts and radius. `bun run registry` at the repo root builds the CSS and registry items.

## Install

Start with a Tailwind v4 app configured for shadcn Base UI. Add the theme, then import its CSS after Tailwind, `tw-animate-css` and `shadcn/tailwind.css` in the app's CSS entry.

```sh
npx shadcn@latest add https://www.mauricekleine.com/r/superthread.json
```

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "../components/superthread/styles/superthread.css";
```

Paper is `:root`; add `.dark` to the document for void. Fonts load from `https://www.mauricekleine.com/fonts/`.

For the fleet rail, run `npx shadcn@latest add https://www.mauricekleine.com/r/fleet-rail.json`. The registry declares stock shadcn `sidebar` and `tooltip` as dependencies. All other components come directly from shadcn.

For the icon rail, run `npx shadcn@latest add https://www.mauricekleine.com/r/fleet-rail.json`. It installs stock shadcn `sidebar` and `tooltip`; default marks load from mauricekleine.com.
