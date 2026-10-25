// Builds the versioned @mk registry from items/catalog.ts with the package's pinned shadcn.
//
//   bun scripts/build-registry.ts [--out <dir>] [--base-url <url>] [--snapshot] [--shadcn <bin>]
//
// The latest form writes <out>/r/ (default out: packages/superthread/out): every item JSON,
// registry.json, versions.json and a copy of every committed versions/<v>/r/ at r/v/<v>/.
// --snapshot writes the snapshot form: the item JSONs, registry.json and SHA256SUMS, with init
// pointing @mk at <base>/r/v/<version>/{name}.json. Without --out it writes versions/<version>/r/
// and refuses a version origin/main already holds; with --out it writes into <dir> itself.
// The base URL is --base-url, else SUPERTHREAD_BASE_URL, else the production host. It changes
// the @mk URL inside init and nothing else. Paths given on the command line resolve against the cwd.
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { catalog, type CatalogItem } from "../items/catalog.ts";
import { derive, floors, owners } from "./imports.ts";

const pkg = join(import.meta.dir, "..");
const production = "https://superthread.mauricekleine.com";

const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const exists = (path: string) => Bun.file(path).exists();

type BuiltFile = { target?: string; content?: string };
type Built = { files?: BuiltFile[]; meta?: unknown; [key: string]: unknown };
const filesSha = (files: BuiltFile[]) => sha256(JSON.stringify(files.map((f) => [f.target, f.content])));

// Stamps: after the last import in TS and TSX, the last line in TS and TSX without imports, line 1 in CSS.
// shadcn strips a TS file's leading comment block on install, so a file with no imports carries its stamp
// after its statements, where it survives.
const importStatement = /^import(?:\s|\{|\*|"|')[^"']*["'][^"'\n]*["'].*$/gm;

function stamp(item: string, version: string, path: string, code: string): string {
  if (path.endsWith(".css")) return `/* @mk/${item} ${version} */\n${code}`;
  if (!/\.tsx?$/.test(path)) throw new Error(`${item}: ${path} is neither TS, TSX nor CSS, so it has no stamp form`);
  const line = `// @mk/${item} ${version}`;
  const last = [...code.matchAll(importStatement)].at(-1);
  if (!last) return `${code.trimEnd()}\n${line}\n`;
  const end = last.index + last[0].length;
  return `${code.slice(0, end)}\n${line}${code.slice(end)}`;
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      out: { type: "string" },
      "base-url": { type: "string" },
      snapshot: { type: "boolean", default: false },
      shadcn: { type: "string" },
    },
    strict: true,
  });

  // 1. the version and the items
  const manifest = JSON.parse(await readFile(join(pkg, "package.json"), "utf8")) as {
    version: string;
    devDependencies: Record<string, string>;
  };
  const version = manifest.version;

  const base = (values["base-url"] || process.env.SUPERTHREAD_BASE_URL || production).replace(/\/+$/, "");
  if (!URL.canParse(base) || !/^https?:$/.test(new URL(base).protocol))
    throw new Error(`base url ${base} is not an http(s) url`);
  // 8. the base reaches init's @mk URL and nothing else
  const mkUrl = values.snapshot ? `${base}/r/v/${version}/{name}.json` : `${base}/r/{name}.json`;

  const shadcn = values.shadcn ? resolve(values.shadcn) : join(pkg, "node_modules/.bin/shadcn");
  if (!(await exists(shadcn))) throw new Error(`no shadcn binary at ${shadcn}; install, or pass --shadcn <path>`);

  // Sources are read once, so the dependencies, the stamps and meta all see the same bytes.
  const sources = new Map<string, string>();
  const missing: string[] = [];
  for (const item of catalog)
    for (const file of item.files) {
      const path = join(pkg, file.path);
      if (await exists(path)) sources.set(file.path, await readFile(path, "utf8"));
      else missing.push(`${item.name}: ${file.path}`);
    }
  if (missing.length > 0) throw new Error(`missing item files:\n  ${missing.join("\n  ")}`);

  // 2. dependencies: the catalog's explicit ones first, then the derived ones
  const ownerOf = owners(catalog);
  const floorOf = floors(manifest.devDependencies);
  const merged = (explicit: string[] | undefined, derived: string[]) => {
    const all = [...new Set([...(explicit ?? []), ...derived])];
    return all.length > 0 ? all : undefined;
  };

  // meta.upstream names the base-nova item, the vendored copy's sha256 and the CLI that fetched it
  let cli: string | undefined;
  const upstreamOf = async (item: CatalogItem) => {
    if (!item.upstream) return null;
    const file = join(pkg, "upstream/base-nova", `${item.upstream}.json`);
    if (!(await exists(file))) throw new Error(`${item.name}: no vendored upstream at ${file}; run upstream fetch`);
    if (cli === undefined) {
      const path = join(pkg, "upstream/manifest.json");
      if (!(await exists(path))) throw new Error(`no ${path}; run upstream fetch`);
      cli = (JSON.parse(await readFile(path, "utf8")) as { cli?: string }).cli;
      if (!cli) throw new Error(`${path} names no cli`);
    }
    return { style: "base-nova", item: item.upstream, sha256: sha256(await readFile(file)), cli };
  };

  // 3. a fresh stage of this run's own, so parallel builds never share one
  const stage = await mkdtemp(join(tmpdir(), "mk-registry-"));
  try {
    const metas = new Map<string, Record<string, unknown>>();
    const entries = [];
    for (const item of catalog) {
      const derived = derive(item, sources, ownerOf, floorOf);
      const stamped = item.files.map((file) => ({
        ...file,
        content: stamp(item.name, version, file.path, sources.get(file.path)!),
      }));
      for (const file of stamped) {
        await mkdir(dirname(join(stage, file.path)), { recursive: true });
        await writeFile(join(stage, file.path), file.content);
      }
      const meta = {
        version,
        sha256: filesSha(stamped),
        tier: item.tier,
        upstream: await upstreamOf(item),
        ...(item.serves ? { serves: item.serves } : {}),
      };
      metas.set(item.name, meta);
      entries.push({
        name: item.name,
        type: item.type,
        ...(item.extends ? { extends: item.extends } : {}),
        title: item.title,
        description: item.description,
        dependencies: merged(item.dependencies, derived.dependencies),
        registryDependencies: merged(item.registryDependencies, derived.registryDependencies),
        files: item.files.length > 0 ? item.files.map(({ path, type, target }) => ({ path, type, target })) : undefined,
        css: item.css,
        config: item.config ? { ...item.config, registries: { ...item.config.registries, "@mk": mkUrl } } : undefined,
        meta,
      });
    }
    // 4. relative paths, so no built files[].path carries an absolute path
    const registry = {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "mk",
      homepage: production,
      items: entries,
    };
    await writeFile(join(stage, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

    // 5. shadcn build, from the stage
    const built = join(stage, ".built");
    const run = Bun.spawnSync([shadcn, "build", "registry.json", "--output", built], {
      cwd: stage,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      timeout: 180_000,
    });
    if (run.exitCode !== 0) throw new Error(`shadcn build exited ${run.exitCode}:\n${run.stdout}${run.stderr}`);

    // 6. meta, added after the build only where the build did not pass it through
    for (const item of catalog) {
      const path = join(built, `${item.name}.json`);
      if (!(await exists(path))) throw new Error(`shadcn build wrote no ${item.name}.json`);
      const json = JSON.parse(await readFile(path, "utf8")) as Built;
      const meta = { ...metas.get(item.name)!, sha256: filesSha(json.files ?? []) };
      if (JSON.stringify(json.meta) !== JSON.stringify(meta)) {
        json.meta = meta;
        await writeFile(path, JSON.stringify(json, null, 2));
      }
    }

    const names = (await readdir(built)).filter((name) => name.endsWith(".json")).sort();
    let dest: string;
    if (values.snapshot) {
      // 9. the snapshot form: never the version files
      if (values.out) {
        dest = resolve(values.out);
        const present = await readdir(dest).catch(() => [] as string[]);
        if (present.length > 0) throw new Error(`--snapshot --out ${dest} is not empty`);
      } else {
        refuseReleased(version);
        await rm(join(pkg, "versions", version), { recursive: true, force: true });
        dest = join(pkg, "versions", version, "r");
      }
      await mkdir(dest, { recursive: true });
      for (const name of names) await cp(join(built, name), join(dest, name));
      const sums = [];
      for (const name of names) sums.push(`${sha256(await readFile(join(dest, name)))}  ${name}\n`);
      await writeFile(join(dest, "SHA256SUMS"), sums.join(""));
    } else {
      dest = join(resolve(values.out ?? join(pkg, "out")), "r");
      await rm(dest, { recursive: true, force: true });
      await mkdir(dest, { recursive: true });
      for (const name of names) await cp(join(built, name), join(dest, name));
      // 7. the version files
      const versions = await committedVersions();
      await writeFile(join(dest, "versions.json"), `${JSON.stringify({ latest: version, versions }, null, 2)}\n`);
      for (const v of versions) await cp(join(pkg, "versions", v, "r"), join(dest, "v", v), { recursive: true });
    }
    const form = values.snapshot ? "snapshot" : "latest";
    console.log(`built @mk ${version} (${form}): ${catalog.length} items, @mk at ${mkUrl} -> ${dest}`);
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function committedVersions(): Promise<string[]> {
  const dir = join(pkg, "versions");
  const found: string[] = [];
  for (const v of await readdir(dir).catch(() => [] as string[]))
    if (await exists(join(dir, v, "r", "registry.json"))) found.push(v);
  return found.sort(Bun.semver.order);
}

// A snapshot on origin/main is released: it never changes, and an item edit needs next.N+1.
function refuseReleased(version: string) {
  const git = (...args: string[]) => Bun.spawnSync(["git", "-C", pkg, ...args], { stdout: "pipe", stderr: "pipe" });
  if (git("rev-parse", "--verify", "--quiet", "origin/main^{commit}").exitCode !== 0)
    throw new Error("origin/main is missing; git fetch origin first, so the snapshot can check what main holds");
  const prefix = git("rev-parse", "--show-prefix").stdout.toString().trim();
  const onMain = git("ls-tree", "--full-tree", "--name-only", "origin/main", "--", `${prefix}versions/${version}`);
  if (onMain.exitCode !== 0) throw new Error(`git ls-tree failed: ${onMain.stderr}`);
  if (onMain.stdout.toString().trim() !== "")
    throw new Error(`versions/${version} is already on origin/main; bump package.json to the next version first`);
}

try {
  await main();
} catch (error) {
  console.error(`build-registry: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
