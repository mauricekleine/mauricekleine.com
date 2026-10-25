import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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

export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    __SUPERTHREAD_VERSION__: JSON.stringify(version),
  },
  resolve: {
    // the site renders the registry's own item sources, under the alias consumers install them to
    alias: [
      { find: "@/components/superthread", replacement: local("../../packages/superthread/items") },
      { find: "@", replacement: local("./src") },
    ],
    // the items and the site share one copy of each, so context-based parts (the toast manager) hold together
    dedupe: ["@base-ui/react", "react", "react-dom"],
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
});
