// The clean room's app: TanStack Start on the Cloudflare Vite plugin, at web's pins.
// It prerenders / and, once clean-room step 8 has copied all-items.tsx in, /all.
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const paths = existsSync(new URL("./src/routes/all.tsx", import.meta.url)) ? ["/", "/all"] : ["/"];

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // no debugger port, so parallel clean rooms never probe for one
      inspectorPort: false,
      config: {
        name: "clean-room",
        main: "@tanstack/react-start/server-entry",
        compatibility_date: "2026-07-16",
        compatibility_flags: ["nodejs_compat"],
      },
    }),
    tanstackStart({
      prerender: { enabled: true, autoSubfolderIndex: false, crawlLinks: false, failOnError: true },
      pages: paths.map((path) => ({ path, prerender: { enabled: true } })),
    }),
    react(),
    tailwindcss(),
  ],
});
