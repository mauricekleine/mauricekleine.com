// mauricekleine.com as a TanStack Start worker with static assets.
// deploy with: bun run deploy (cf deploy --prebuilt from apps/web)
import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "mauricekleine-com",
    compatibilityDate: "2026-07-16",
    compatibilityFlags: ["nodejs_compat"],
    // the custom server entry handles the existing HTTP behavior
    entrypoint: "./src/server.ts",
    // custom domains only; no workers.dev duplicate
    workersDev: false,
    assets: {
      // /about serves about.html; /about.html redirects to /about
      htmlHandling: "auto-trailing-slash",
      // missing routes get the "lost in space" page
      notFoundHandling: "404-page",
      // the worker fronts everything: apex redirect needs to see every path
      runWorkerFirst: true,
    },
    // apex is also served by the worker; the custom server sends it to www.
    // mk.wtf only serves the short links in src/links.ts
    domains: ["www.mauricekleine.com", "mauricekleine.com", "mk.wtf", "www.mk.wtf"],
    env: {
      ASSETS: bindings.assets(),
      // signup secrets; declared so a deploy fails instead of shipping without them
      RESEND_API_KEY: bindings.secret(),
      RESEND_SEGMENT_ID: bindings.secret(),
      SUBSCRIBE_SECRET: bindings.secret(),
      TURNSTILE_SECRET: bindings.secret(),
    },
  },
});
