// Writes the registry's payloads out as files: every file of every item in public/r/, at the path it installs to
// under an app's components/superthread/, into .payload/. The production build renders the site from these files, so
// a page shows the bytes an app installs, stamps included. Run after the registry build; build:superthread and
// dev:superthread do. With --check it writes nothing and exits 1 when .payload/ differs from public/r/.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const r = join(app, "public/r");
const out = join(app, ".payload");
const PREFIX = "@components/superthread/";

/** Every file the registry serves, keyed by its path under .payload/. */
export function payloadFiles(dir = r) {
  const registry = join(dir, "registry.json");
  if (!existsSync(registry)) throw new Error(`no ${relative(app, registry)}; build the registry first`);
  const files = new Map();
  for (const { name } of JSON.parse(readFileSync(registry, "utf8")).items) {
    const item = JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8"));
    for (const file of item.files ?? []) {
      if (!file.target.startsWith(PREFIX)) throw new Error(`${name}: target ${file.target} is outside ${PREFIX}`);
      const path = file.target.slice(PREFIX.length);
      if (files.has(path)) throw new Error(`${name} and another item both install ${path}`);
      files.set(path, file.content);
    }
  }
  return files;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

/** What differs between .payload/ and the payloads: missing, changed and extra paths. */
export function drift(files = payloadFiles()) {
  const problems = [];
  for (const [path, content] of files) {
    const file = join(out, path);
    if (!existsSync(file)) problems.push(`${path}: missing`);
    else if (readFileSync(file, "utf8") !== content) problems.push(`${path}: differs from its payload`);
  }
  for (const file of walk(out)) {
    const path = relative(out, file).split(sep).join("/");
    if (!files.has(path)) problems.push(`${path}: no item installs it`);
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--check")) {
    const problems = drift();
    for (const line of problems) console.error(`payload: ${line}`);
    process.exit(problems.length > 0 ? 1 : 0);
  }
  const files = payloadFiles();
  rmSync(out, { recursive: true, force: true });
  for (const [path, content] of files) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), content);
  }
  console.log(`payload: wrote ${files.size} files from public/r/ to .payload/`);
}
