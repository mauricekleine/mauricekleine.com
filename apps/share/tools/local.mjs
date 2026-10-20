import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { fileURLToPath } from "node:url";
export function localWorker(options = {}) {
  return new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      scriptPath: fileURLToPath(new URL("../dist/worker.js", import.meta.url)),
      compatibilityDate: "2026-10-01",
      bindings: {
        ADMIN_TOKEN: "local-test-admin-only",
        COOKIE_KEY: "local-test-cookie-key-only",
        BUILD_SHA: "local-test",
      },
      r2Buckets: ["BUCKET"],
      durableObjects: { STORE: { className: "ShareStore", useSQLite: true } },
      ...options,
    }),
  );
}
