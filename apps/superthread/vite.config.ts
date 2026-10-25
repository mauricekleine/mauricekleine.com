import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { prerenderPaths } from "./src/site/nav.ts";

const local = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// the masthead prints the HEAD commit's date as dd.mm.yy, so a build of one commit always prints the same date
const buildDate = execFileSync("git", ["log", "-1", "--format=%cd", "--date=format:%d.%m.%y"], {
  encoding: "utf8",
}).trim();
// and the registry's version, from the package that ships it
const version = (
  JSON.parse(readFileSync(local("../../packages/superthread/package.json"), "utf8")) as { version: string }
).version;

// every @base-ui/react entry the site and the items import, bundled before the first page: an entry found later, on
// a page's first visit, makes vite optimise again and reload the page under whatever is driving it
const baseUi = [local("./src"), local("../../packages/superthread/items")].flatMap((dir) =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file))
    .flatMap((file) =>
      [...readFileSync(join(dir, file), "utf8").matchAll(/["'](@base-ui\/react\/[\w-]+)["']/g)].map((hit) => hit[1]!),
    ),
);

// a build renders the items from the registry's payloads, written to .payload/ by tools/payload.mjs, so every page
// shows the bytes an app installs; dev renders their sources, so an edit to an item reloads at once
const payload = local("./.payload");
const items = (command: "build" | "serve") => {
  if (command === "serve") return local("../../packages/superthread/items");
  if (!existsSync(payload)) throw new Error("no .payload/; run bun run build:superthread from the repo root");
  return payload;
};

export default defineConfig(({ command }) => ({
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    __SUPERTHREAD_VERSION__: JSON.stringify(version),
  },
  resolve: {
    // the site renders the registry's own item sources, under the alias consumers install them to
    alias: [
      // the catalog is the registry's index, not a served item, so it always comes from the source
      { find: "@/components/superthread/catalog", replacement: local("../../packages/superthread/items/catalog.ts") },
      { find: "@/components/superthread", replacement: items(command) },
      { find: "@", replacement: local("./src") },
    ],
    // the items and the site share one copy of each, so context-based parts (the toast manager) hold together
    dedupe: ["@base-ui/react", "react", "react-dom"],
  },
  optimizeDeps: { include: [...new Set(baseUi)].sort() },
  server: {
    // the tools' scratch and shots, and the build's own output: a build or a shoot run must not reload the dev server
    watch: { ignored: ["**/.out/**", "**/.shots/**", "**/.cloudflare/**", "**/dist/**"] },
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      experimental: { newConfig: { cfBuildOutput: true } },
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: prerenderPaths.map((path) => ({ path, prerender: { enabled: true } })),
    }),
    react(),
    tailwindcss(),
  ],
}));
