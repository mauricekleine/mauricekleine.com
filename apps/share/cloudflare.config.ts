import { execFileSync } from "node:child_process";
import { bindings, defineConfig, exports } from "cf/config";

export default defineConfig({
  worker: {
    name: "artifact-share",
    entrypoint: "./dist/worker.js",
    compatibilityDate: "2026-10-01",
    workersDev: false,
    domains: ["share.mauricekleine.com"],
    observability: { enabled: true, traces: { enabled: true } },
    exports: { ShareStore: exports.durableObject({ storage: "sqlite" }) },
    env: {
      BUCKET: bindings.r2({ name: "artifact-share" }),
      STORE: bindings.durableObject({ worker: "artifact-share", exportName: "ShareStore" }),
      ADMIN_TOKEN: bindings.secret(),
      COOKIE_KEY: bindings.secret(),
      BUILD_SHA: bindings.text(
        process.env.BUILD_SHA || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
      ),
    },
  },
});
