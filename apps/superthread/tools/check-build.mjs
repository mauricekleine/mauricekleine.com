// Checks the built site, after `vite build`: every page is there with the theme script first in its head, the
// served words hold the rules (no em dash, no private host, no prose lifted from the surface contract), every
// raster says where it came from, the registry is complete and serves every published snapshot byte for byte, init
// points at the base it was built for, the deploy stamp is HEAD, the mock pages compose registry components only, and
// the pages rendered the registry's payloads as served.
// Prints each failure and exits 1 on any. CHECK_BUILD_OUT and CHECK_BUILD_VERSIONS point it at another client output
// and another versions/ tree, for a negative control on a copy.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(app, "../../packages/superthread");
const { prerenderPaths } = await import("../src/site/nav.ts");
const { themeScript } = await import("../../../packages/superthread/items/lib/theme.ts");
const { catalog } = await import("../../../packages/superthread/items/catalog.ts");

const failures = [];
const fail = (check, message) => failures.push(`${check}: ${message}`);
const passed = [];
const done = (check, detail) => passed.push(detail ? `${check} (${detail})` : check);

// Published versions are immutable, so this list only grows.
const PUBLISHED_VERSIONS = [
  "2.0.0-next.1",
  "2.0.0-next.2",
  "2.0.0-next.3",
  "2.0.0-next.4",
  "2.0.0",
  "2.1.0",
  "2.1.1",
  "2.2.0",
  "2.3.0",
  "2.3.1",
  "2.4.0",
];

// the client output: cf's build output, or Vite's own when the Cloudflare plugin writes there
const outputs = process.env.CHECK_BUILD_OUT
  ? [process.env.CHECK_BUILD_OUT]
  : [join(app, ".cloudflare/output/v0/workers/default/assets"), join(app, "dist/client")];
const out = outputs.find((dir) => existsSync(dir));
if (!out) {
  console.error("check-build: no build output; run vite build first");
  process.exit(1);
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const served = walk(out);
const rel = (path) => relative(out, path).split(sep).join("/");
const textual = new Set([".html", ".js", ".mjs", ".css", ".json", ".txt", ".svg", ".xml", ".md", ".webmanifest", ""]);
const isText = (path) => textual.has(extname(path)) && statSync(path).size < 8_000_000;
// a licence file by name, alone or after a prefix (SIL-OFL.txt, Fragment-LICENSE.txt)
const isLicence = (path) => /(^|[/_.-])(licen[cs]e|ofl|copying)[^/]*$/i.test(rel(path));

// 1. every nav page and /404 prerendered, the theme script first in <head> (server.ts puts it there)
const htmlFor = (path) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);
for (const path of prerenderPaths) {
  const file = join(out, htmlFor(path));
  if (!existsSync(file)) {
    fail("prerender", `${path} has no ${htmlFor(path)}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1];
  if (head === undefined) fail("theme script", `${path} has no <head>`);
  else if (!head.startsWith(`<script>${themeScript}</script>`))
    fail("theme script", `${path}: <head> starts with ${JSON.stringify(head.slice(0, 80))}`);
  // the script goes ahead of the charset, which still has to sit in the first 1024 bytes
  const charset = Buffer.from(html).indexOf(Buffer.from('<meta charSet="utf-8"/>'));
  if (charset < 0 || charset > 1024) fail("charset", `${path}: <meta charSet> is not in the first 1024 bytes`);
}
done("prerender, theme script order and charset", `${prerenderPaths.length} pages`);

// 2. served words: no em dash, no private host or address
const privateHost = [
  /\b[a-z0-9-]+\.ts\.net\b/i,
  /\btailnet\b/i,
  /\b[a-z0-9-]+\.(internal|lan|home\.arpa|corp)\b/i,
  /\b100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}\b/,
  /\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
  /\b172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/,
  /\b192\.168\.\d{1,3}\.\d{1,3}\b/,
];
let scanned = 0;
for (const file of served.filter((path) => isText(path) && !isLicence(path))) {
  const text = readFileSync(file, "utf8");
  scanned++;
  if (text.includes("\u2014")) fail("em dash", rel(file));
  for (const pattern of privateHost) {
    const hit = pattern.exec(text);
    if (hit) fail("private host", `${rel(file)}: ${hit[0]}`);
  }
}
done("em dash and private hosts", `${scanned} served files`);

// 3. no 8-word run of the surface contract's prose in anything served or in src; its code spans are not prose
const contract = join(app, ".impeccable/surfaces/apps-superthread-src-routes-index-tsx.md");
const words = (text) => text.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)*/g) ?? [];
const stripCode = (text) => text.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
const shingles = (list) => {
  const set = new Set();
  for (let i = 0; i + 8 <= list.length; i++) set.add(list.slice(i, i + 8).join(" "));
  return set;
};
if (!existsSync(contract)) fail("contract", "the surface contract is missing");
else {
  const body = readFileSync(contract, "utf8").replace(/^---[\s\S]*?\n---\n/, "");
  const lifted = shingles(words(stripCode(body)));
  const sources = walk(join(app, "src")).filter((path) => /\.(tsx?|css|json|md)$/.test(path));
  const targets = [...new Set([...served.filter(isText), ...sources])];
  for (const file of targets) {
    let text = readFileSync(file, "utf8");
    if (file.endsWith(".html")) text = text.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
    for (const run of shingles(words(stripCode(text))))
      if (lifted.has(run)) {
        fail("contract prose", `${relative(app, file)}: "${run}"`);
        break;
      }
  }
  done("contract prose", `${lifted.size} runs against ${targets.length} files`);
}

// 4. provenance: every PNG names its Source, every texture and mark file is in its PROVENANCE.json
function pngSource(file) {
  const bytes = readFileSync(file);
  if (bytes.readUInt32BE(0) !== 0x89504e47) return false;
  for (let at = 8; at + 8 <= bytes.length;) {
    const length = bytes.readUInt32BE(at);
    const type = bytes.toString("latin1", at + 4, at + 8);
    if (type === "tEXt") {
      const data = bytes.subarray(at + 8, at + 8 + length);
      const nul = data.indexOf(0);
      if (nul > 0 && data.toString("latin1", 0, nul) === "Source" && nul + 1 < data.length) return true;
    }
    if (type === "IEND") break;
    at += 12 + length;
  }
  return false;
}
const pngs = served.filter((path) => path.endsWith(".png"));
for (const file of pngs) if (!pngSource(file)) fail("png source", `${rel(file)} has no tEXt Source chunk`);
function named(value, into = new Set()) {
  if (typeof value === "string") into.add(value);
  else if (Array.isArray(value)) for (const item of value) named(item, into);
  else if (value && typeof value === "object")
    for (const [key, item] of Object.entries(value)) {
      into.add(key);
      named(item, into);
    }
  return into;
}
let traced = 0;
for (const area of ["texture", "marks"]) {
  const dir = join(out, area);
  const files = walk(dir).filter((path) => basename(path) !== "PROVENANCE.json");
  if (files.length === 0) continue;
  const record = join(dir, "PROVENANCE.json");
  if (!existsSync(record)) {
    fail("provenance", `${area}/ has ${files.length} files and no PROVENANCE.json`);
    continue;
  }
  const names = named(JSON.parse(readFileSync(record, "utf8")));
  if (area === "marks") {
    const downloads = join(dir, "DOWNLOADS.json");
    if (!existsSync(downloads)) fail("provenance", "marks/DOWNLOADS.json is missing");
    else {
      names.add("DOWNLOADS.json");
      const generated = JSON.parse(readFileSync(downloads, "utf8"));
      for (const [file, receipt] of Object.entries(generated.files)) {
        names.add(file);
        if (!existsSync(join(dir, file))) fail("mark downloads", `${file} is missing`);
        else if (
          createHash("sha256")
            .update(readFileSync(join(dir, file)))
            .digest("hex") !== receipt.sha256
        )
          fail("mark downloads", `${file} differs from its provenance`);
      }
    }
  }
  for (const file of files) {
    const local = relative(dir, file).split(sep).join("/");
    if (![local, `${area}/${local}`, `/${area}/${local}`, basename(file)].some((name) => names.has(name)))
      fail("provenance", `${area}/${local} is not in ${area}/PROVENANCE.json`);
    else traced++;
  }
}
done("provenance", `${pngs.length} PNGs, ${traced} files traced`);

// 5. every plate texture.gen.ts names is served
const gen = readFileSync(join(app, "src/site/texture.gen.ts"), "utf8");
const plateFiles = [...gen.matchAll(/"(\/texture\/[^"]+)"/g)].map((hit) => hit[1]);
for (const path of plateFiles) if (!existsSync(join(out, path))) fail("plates", `${path} is named but not served`);
done("plates", `${plateFiles.length} files named`);

// 6. the registry: every catalog item; exactly the published snapshots, in the source and served, each file for file
// and byte for byte; init's @mk at the base built for
const r = join(out, "r");
const versionsDir = process.env.CHECK_BUILD_VERSIONS || join(pkg, "versions");
const servedVersions = join(r, "v");
const subdirs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
const inventory = (dir) => new Set(walk(dir).map((path) => relative(dir, path).split(sep).join("/")));
const sourceVersions = subdirs(versionsDir);
if (!existsSync(versionsDir)) fail("snapshot", "the source versions/ is missing");
else if (sourceVersions.length === 0) fail("snapshot", "the source versions/ holds no version");
const snapshotFiles = [];
for (const version of [...new Set([...PUBLISHED_VERSIONS, ...sourceVersions, ...subdirs(servedVersions)])].sort()) {
  const committed = join(versionsDir, version, "r");
  const copy = join(servedVersions, version);
  if (!PUBLISHED_VERSIONS.includes(version)) fail("snapshot", `${version} is a snapshot but not in PUBLISHED_VERSIONS`);
  if (!existsSync(join(versionsDir, version))) fail("snapshot", `versions/${version} is missing from the source`);
  else if (!existsSync(committed)) fail("snapshot", `versions/${version} has no r/`);
  if (!existsSync(copy)) fail("snapshot", `r/v/${version} is not served`);
  if (!existsSync(committed) || !existsSync(copy)) continue;
  const want = inventory(committed);
  const have = inventory(copy);
  if (want.size === 0) fail("snapshot", `versions/${version}/r/ is empty`);
  for (const local of want) {
    if (!have.has(local)) fail("snapshot", `r/v/${version}/${local} is missing`);
    else if (!readFileSync(join(copy, local)).equals(readFileSync(join(committed, local))))
      fail("snapshot", `r/v/${version}/${local} differs from versions/${version}/r/${local}`);
  }
  for (const local of have)
    if (!want.has(local)) fail("snapshot", `r/v/${version}/${local} is served but not in versions/${version}/r/`);
  snapshotFiles.push(`${version}: ${want.size} files`);
}
const registryFile = join(r, "registry.json");
if (!existsSync(registryFile)) fail("registry", "r/registry.json is missing");
else {
  const listed = new Set(JSON.parse(readFileSync(registryFile, "utf8")).items.map((item) => item.name));
  for (const item of catalog) {
    if (!listed.has(item.name)) fail("registry", `r/registry.json does not list ${item.name}`);
    if (!existsSync(join(r, `${item.name}.json`))) fail("registry", `r/${item.name}.json is missing`);
  }
  const base = (process.env.SUPERTHREAD_BASE_URL || "https://superthread.mauricekleine.com").replace(/\/+$/, "");
  const initFile = join(r, "init.json");
  if (!existsSync(initFile)) fail("init", "r/init.json is missing");
  else {
    const mk = JSON.parse(readFileSync(initFile, "utf8")).config?.registries?.["@mk"];
    if (mk !== `${base}/r/{name}.json`) fail("init", `@mk is ${JSON.stringify(mk)}, not ${base}/r/{name}.json`);
  }
  done("registry", `${catalog.length} items, snapshots ${snapshotFiles.join(", ")}, @mk at ${base}`);
}

// 7. the deploy stamp is the commit built
const stamp = join(out, "api/deploy.json");
const head =
  process.env.WORKERS_CI_COMMIT_SHA || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!existsSync(stamp)) fail("deploy stamp", "api/deploy.json is missing");
else if (JSON.parse(readFileSync(stamp, "utf8")).sha !== head) fail("deploy stamp", `api/deploy.json is not ${head}`);
else done("deploy stamp", head.slice(0, 12));

// 8. mock pages import registry components, src/mock and the app shell, plus the router itself
const allowed = [
  /^@\/components\/superthread\//,
  /^@\/mock(\/|$)/,
  /^\.\.\/\.\.\/mock(\/|$)/,
  /^@\/site\/AppShell$/,
  /^\.\.\/\.\.\/site\/AppShell$/,
  /^@tanstack\/react-router$/,
  /^react$/,
];
const mocks = walk(join(app, "src/routes/mock"));
for (const file of mocks) {
  const code = readFileSync(file, "utf8");
  for (const hit of code.matchAll(
    /(?:^|\n)\s*(?:import|export)\b[^"';]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g,
  )) {
    const spec = hit[1] ?? hit[2];
    if (!allowed.some((pattern) => pattern.test(spec))) fail("mock imports", `${relative(app, file)} imports ${spec}`);
  }
}
done("mock imports", `${mocks.length} pages`);

// 9. the pages rendered the payloads: .payload/ holds every file the served registry installs, byte for byte
{
  const { drift, payloadFiles } = await import("./payload.mjs");
  const files = payloadFiles(join(out, "r"));
  const problems = drift(files);
  for (const problem of problems) fail("payload", problem);
  if (problems.length === 0) done("payload", `${files.size} files`);
}

if (failures.length > 0) {
  for (const line of failures) console.error(`check-build: ${line}`);
  console.error(`check-build: ${failures.length} failures`);
  process.exit(1);
}
for (const line of passed) console.log(`check-build: ok ${line}`);
