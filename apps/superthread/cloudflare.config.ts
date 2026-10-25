// superthread.mauricekleine.com as a TanStack Start worker with static assets.
// deploy with: bun run deploy:superthread (cf deploy --prebuilt from apps/superthread)
import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "superthread",
    compatibilityDate: "2026-07-16",
    compatibilityFlags: ["nodejs_compat"],
    // the custom server entry sets the font headers (src/server-behavior.ts)
    entrypoint: "./src/server.ts",
    workersDev: false,
    // no domains: superthread.mauricekleine.com waits for the operator step
    assets: {
      // /install serves install.html; /install.html redirects to /install
      htmlHandling: "auto-trailing-slash",
      // missing routes get the prerendered /404
      notFoundHandling: "404-page",
      // the worker sees only the fonts, which need their CORS rule; public/_headers covers the rest
      runWorkerFirst: ["/fonts/*"],
    },
    env: { ASSETS: bindings.assets() },
  },
});
