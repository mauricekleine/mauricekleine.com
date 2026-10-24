// Publishes the frozen v1 registry: copies the committed v1/r/*.json byte for byte into --out.
// No shadcn build runs for v1, so a CLI upgrade cannot change what www serves at /r.
// The default --out is www's public/r under the repo root; a given --out resolves against the cwd.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const pkg = join(import.meta.dir, "..");
const source = join(pkg, "v1/r");

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: { out: { type: "string", default: join(pkg, "../../apps/web/public/r") } },
  strict: true,
});
const out = resolve(values.out);

const files = (await readdir(source)).filter((name) => name.endsWith(".json")).sort();
if (files.length === 0) throw new Error(`no v1 registry files in ${source}`);

await mkdir(out, { recursive: true });
for (const name of files) await copyFile(join(source, name), join(out, name));
console.log(`published v1: ${files.join(", ")} -> ${out}`);
