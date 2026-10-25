import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "taze";

// Taze does not read bunfig.toml, so Bun parses it here instead of the gate being copied.
// Without a gate, use the skill's fallback: 3 days, no exemptions.
const bunfig = fileURLToPath(new URL("./bunfig.toml", import.meta.url));
const parse =
  'console.log(JSON.stringify(Bun.TOML.parse(require("node:fs").readFileSync(process.argv.at(-1), "utf8")).install ?? {}))';
const install = existsSync(bunfig) ? JSON.parse(execFileSync("bun", ["-e", parse, bunfig], { encoding: "utf8" })) : {};
const gated = typeof install.minimumReleaseAge === "number";
if (!gated) console.warn("bunfig.toml sets no [install] minimumReleaseAge; using 3 days");

export default defineConfig({
  recursive: true,
  includeLocked: true,
  requestTimeout: 30_000,
  maturityPeriod: (gated ? install.minimumReleaseAge : 259_200) / 86_400,
  maturityPeriodExclude: gated ? (install.minimumReleaseAgeExcludes ?? []) : [],
  // The clean-room fixture keeps its own lock, and the template is upstream's pinned copy.
  // When web's pins move, refresh the fixture lock with `bun run test:clean-room -- --refresh-lock`.
  ignorePaths: ["packages/superthread/test/clean-room/fixture/**", "packages/superthread/upstream/templates/**"],
  // Holds: `name` or `name@range` (e.g. 'typescript@7'), each with its reason above it.
  exclude: [],
});
