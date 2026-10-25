// The clean room: installs the @mk registry into a fresh TanStack Start app with the shadcn CLI
// and proves the contract end to end. Every app lives in a fresh directory under $TMPDIR.
//
//   bun test/clean-room/run.ts [--record] [--keep <name>] [--overlay <file...>]
//                              [--registry <url>] [--cli latest] [--refresh-lock]
//
// --record        forwards /upstream/** to ui.shadcn.com and rewrites upstream/cli/ from the responses
// --keep <name>   leaves the step 8 app (every item installed and built) at test/clean-room/.out/<name>/
// --overlay <f..> builds the registry from `git archive HEAD` plus only the named working-tree files
// --registry <u>  installs from a running site's /r instead of a local build
// --cli latest    runs `bun x --bun shadcn@latest` instead of the package's pinned binary (non-gating in CI)
// --refresh-lock  regenerates fixture/bun.lock in a $TMPDIR copy and copies it back
//
// Every CLI call gets REGISTRY_URL at the counting /upstream mirror, a Bun user agent, the pinned
// template (upstream/templates) as SHADCN_TEMPLATE_DIR, a closed stdin and a 180 second timeout, so a
// prompt fails fast instead of hanging. The report goes to test/clean-room/.out/report.json.
import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { catalog } from "../../items/catalog.ts";

const here = import.meta.dir;
const pkg = resolve(here, "../..");
const fixture = join(here, "fixture");
const outDir = join(here, ".out");
const mirror = join(pkg, "upstream/cli");
const templates = join(pkg, "upstream/templates");
const pinnedBin = join(pkg, "node_modules/.bin/shadcn");
const upstreamOrigin = "https://ui.shadcn.com";
const userAgent = "bun/1.4.4";

const CLI_TIMEOUT = 180_000;
const INSTALL_TIMEOUT = 300_000;
const BUILD_TIMEOUT = 600_000;

// The three lines tokens' css field adds to the app's stylesheet.
const IMPORTS = [
  '@import "tw-animate-css";',
  '@import "shadcn/tailwind.css";',
  '@import "./components/superthread/styles/superthread.css";',
];
const SUPERTHREAD_IMPORT = IMPORTS[2]!;

// Directories that hold installs and build output, never app sources.
const BUILD_DIRS = new Set(["node_modules", "dist", ".wrangler", ".tanstack", ".cloudflare", ".vite"]);

const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");

class Failure extends Error {}
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Failure(message);
}

// ---------------------------------------------------------------------------------------------
// arguments

const argv = Bun.argv.slice(2).filter((arg) => arg !== "--");
const { values, positionals } = parseArgs({
  args: argv,
  options: {
    record: { type: "boolean", default: false },
    keep: { type: "string" },
    overlay: { type: "string", multiple: true },
    registry: { type: "string" },
    cli: { type: "string" },
    "refresh-lock": { type: "boolean", default: false },
  },
  allowPositionals: true,
  strict: true,
});

function usage(message: string): never {
  console.error(`clean-room: ${message}`);
  process.exit(2);
}

const overlay = values.overlay ? [...values.overlay, ...positionals] : [];
if (!values.overlay && positionals.length > 0) usage(`unexpected arguments: ${positionals.join(" ")}`);
if (values.cli !== undefined && values.cli !== "latest") usage(`--cli takes only "latest", not ${values.cli}`);
const latest = values.cli === "latest";
if (latest && values.record) usage("--record records the pinned CLI; drop --cli latest");
if (values.registry && overlay.length > 0) usage("--overlay builds a local registry; drop --registry");
if (values.keep !== undefined && !/^[a-z0-9][a-z0-9.-]*$/.test(values.keep))
  usage(`--keep takes a plain directory name, not ${values.keep}`);
const siteBase = values.registry?.replace(/\/+$/, "");
if (siteBase && !URL.canParse(siteBase)) usage(`--registry ${values.registry} is not a url`);

// ---------------------------------------------------------------------------------------------
// processes

const tag = values.keep ?? (values.record ? "record" : latest ? "latest" : "run");
const logDir = join(outDir, "logs", tag);
let logCount = 0;

// out is stdout and stderr together, for messages; stdout alone is for parsing.
type Ran = { code: number; out: string; stdout: string; ms: number; log: string };

async function exec(
  cmd: string[],
  options: { cwd: string; env?: Record<string, string | undefined>; timeout: number; label: string },
): Promise<Ran> {
  const started = performance.now();
  const proc = Bun.spawn(cmd, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    timeout: options.timeout,
    killSignal: "SIGKILL",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const code = await proc.exited;
  const ms = Math.round(performance.now() - started);
  const out = `${stdout}${stderr}`;
  logCount += 1;
  const log = join(logDir, `${String(logCount).padStart(2, "0")}-${options.label}.log`);
  const timedOut = proc.signalCode === "SIGKILL" ? `\n[killed after ${options.timeout} ms]` : "";
  await writeFile(log, `$ ${cmd.join(" ")}\n# cwd ${options.cwd}\n# exit ${code} in ${ms} ms${timedOut}\n\n${out}`);
  return { code, out, stdout, ms, log: relative(here, log) };
}

function tail(text: string, lines = 30) {
  return text.trimEnd().split("\n").slice(-lines).join("\n");
}

async function expectOk(ran: Ran, what: string) {
  check(ran.code === 0, `${what} exited ${ran.code} (log ${ran.log}):\n${tail(ran.out)}`);
}

// ---------------------------------------------------------------------------------------------
// the CLI under test

let templateCopy = "";
let origin = "";

function cliEnv(): Record<string, string | undefined> {
  return {
    ...process.env,
    REGISTRY_URL: `${origin}/upstream/r`,
    npm_config_user_agent: userAgent,
    SHADCN_TEMPLATE_DIR: templateCopy,
    NO_COLOR: "1",
    FORCE_COLOR: "0",
  };
}

const cliCommand = latest ? [process.execPath, "x", "--bun", "shadcn@latest"] : [process.execPath, pinnedBin];

function shadcn(args: string[], cwd: string, label: string) {
  return exec([...cliCommand, ...args], { cwd, env: cliEnv(), timeout: CLI_TIMEOUT, label });
}

async function cliVersion(): Promise<{ version: string; from: string }> {
  if (!latest) {
    const file = join(dirname(dirname(realpathSync(pinnedBin))), "package.json");
    const { version } = JSON.parse(await readFile(file, "utf8")) as { version: string };
    return { version, from: relative(pkg, file) };
  }
  const ran = await exec([...cliCommand, "--version"], { cwd: tmpdir(), timeout: CLI_TIMEOUT, label: "cli-version" });
  await expectOk(ran, "shadcn@latest --version");
  const version = ran.stdout.match(/^\s*(\d+\.\d+\.\d+\S*)\s*$/m)?.[1];
  check(version, `shadcn@latest --version printed no version (log ${ran.log})`);
  return { version, from: "shadcn@latest --version" };
}

// ---------------------------------------------------------------------------------------------
// the server: /r/** from the registry build, /upstream/** from the recorded mirror

type Recorded = { path: string; file: string; status: number; type: string };
type Served = { path: string; status: number; from: "mirror" | "upstream" | "missing" };

const served: Served[] = [];
const recorded = new Map<string, Recorded>();
let registryDir = "";

// A request's mirror file: its path, plus a hash of its query when it has one.
function mirrorFile(pathname: string, search: string): string | null {
  const rest = decodeURIComponent(pathname.slice("/upstream/".length));
  if (rest === "" || rest.split("/").some((part) => part === ".." || part === "." || part === "")) return null;
  return search ? `${rest}@${sha256(search).slice(0, 16)}` : rest;
}

async function loadMirror() {
  const index = join(mirror, "requests.json");
  if (!existsSync(index)) return;
  const { requests } = JSON.parse(await readFile(index, "utf8")) as { requests: Recorded[] };
  for (const entry of requests) recorded.set(entry.path, entry);
}

async function upstream(url: URL): Promise<Response> {
  const path = `${url.pathname}${url.search}`;
  const file = mirrorFile(url.pathname, url.search);
  if (!file) {
    served.push({ path, status: 404, from: "missing" });
    return new Response("not a mirror path", { status: 404 });
  }
  if (values.record) {
    const response = await fetch(`${upstreamOrigin}/${url.pathname.slice("/upstream/".length)}${url.search}`);
    const body = new Uint8Array(await response.arrayBuffer());
    const type = response.headers.get("content-type") ?? "application/octet-stream";
    if (response.ok) {
      await mkdir(dirname(join(mirror, file)), { recursive: true });
      await writeFile(join(mirror, file), body);
    }
    recorded.set(path, { path, file, status: response.status, type });
    served.push({ path, status: response.status, from: "upstream" });
    return new Response(body, { status: response.status, headers: { "content-type": type } });
  }
  const entry = recorded.get(path);
  if (!entry || entry.status !== 200 || !existsSync(join(mirror, entry.file))) {
    served.push({ path, status: 404, from: "missing" });
    return new Response(`not in the recorded mirror: ${path}`, { status: 404 });
  }
  served.push({ path, status: 200, from: "mirror" });
  return new Response(Bun.file(join(mirror, entry.file)), { headers: { "content-type": entry.type } });
}

function registryFile(pathname: string): Response {
  const rest = decodeURIComponent(pathname.slice("/r/".length));
  const file = resolve(registryDir, rest);
  if (!registryDir || !file.startsWith(registryDir + sep) || !existsSync(file))
    return new Response("not found", { status: 404 });
  return new Response(Bun.file(file), { headers: { "content-type": "application/json" } });
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/upstream/")) return upstream(url);
    if (url.pathname.startsWith("/r/")) return registryFile(url.pathname);
    return new Response("not found", { status: 404 });
  },
});
origin = `http://127.0.0.1:${server.port}`;

// ---------------------------------------------------------------------------------------------
// registry items and installed files

type Item = {
  name: string;
  files?: { target?: string; content?: string }[];
  registryDependencies?: string[];
  config?: { registries?: Record<string, string> };
};

let base = "";
let version = "";

async function item(name: string, from = `${base}/r`): Promise<Item> {
  const response = await fetch(`${from}/${name}.json`);
  check(response.ok, `${from}/${name}.json answered ${response.status}`);
  return (await response.json()) as Item;
}

// The items an add of `names` installs: the names and their @mk dependencies, recursively.
async function closure(names: string[], from?: string): Promise<Item[]> {
  const seen = new Map<string, Item>();
  const queue = [...names];
  while (queue.length > 0) {
    const name = queue.shift()!;
    if (seen.has(name)) continue;
    const found = await item(name, from);
    seen.set(name, found);
    for (const dependency of found.registryDependencies ?? []) {
      check(dependency.startsWith("@mk/"), `${name} depends on ${dependency}, which is not an @mk item`);
      queue.push(dependency.slice("@mk/".length));
    }
  }
  return [...seen.values()];
}

// An item target such as @components/superthread/ui/button.tsx, as the app path the CLI writes.
function installedPath(target: string): string {
  check(target.startsWith("@components/"), `target ${target} is not under @components/`);
  return join("src/components", target.slice("@components/".length));
}

function stampOf(name: string, path: string) {
  return path.endsWith(".css") ? `/* @mk/${name} ${version} */` : `// @mk/${name} ${version}`;
}

// Every file of every item is installed; returns the app paths.
function checkPresent(app: string, items: Item[]): string[] {
  const files = items.flatMap((entry) => (entry.files ?? []).map((file) => installedPath(file.target ?? "")));
  const missing = files.filter((path) => !existsSync(join(app, path)));
  check(missing.length === 0, `not installed:\n  ${missing.join("\n  ")}`);
  return files.sort();
}

// Every installed file carries its item's stamp, as a line of its own.
async function checkStamps(app: string, items: Item[]) {
  const unstamped: string[] = [];
  for (const entry of items)
    for (const file of entry.files ?? []) {
      const path = installedPath(file.target ?? "");
      const lines = (await readFile(join(app, path), "utf8")).split("\n").map((line) => line.trim());
      if (!lines.includes(stampOf(entry.name, path))) unstamped.push(`${path} (wants ${stampOf(entry.name, path)})`);
    }
  check(unstamped.length === 0, `installed without their stamp:\n  ${unstamped.join("\n  ")}`);
}

// sha256 of every app file outside installs and build output.
async function hashTree(dir: string, under = ""): Promise<Map<string, string>> {
  const hashes = new Map<string, string>();
  const walk = async (rel: string) => {
    for (const entry of await readdir(join(dir, rel), { withFileTypes: true })) {
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!BUILD_DIRS.has(entry.name)) await walk(path);
      } else if (entry.isFile()) hashes.set(path, sha256(await readFile(join(dir, path))));
    }
  };
  if (existsSync(join(dir, under))) await walk(under);
  return hashes;
}

function changed(before: Map<string, string>, after: Map<string, string>): string[] {
  const paths = new Set([...before.keys(), ...after.keys()]);
  return [...paths].filter((path) => before.get(path) !== after.get(path)).sort();
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

// ---------------------------------------------------------------------------------------------
// apps

let root = "";

async function install(app: string, label: string, frozen = true) {
  const args = [process.execPath, "install", ...(frozen ? ["--frozen-lockfile"] : [])];
  let ran = await exec(args, { cwd: app, timeout: INSTALL_TIMEOUT, label });
  if (ran.code !== 0) ran = await exec(args, { cwd: app, timeout: INSTALL_TIMEOUT, label: `${label}-retry` });
  await expectOk(ran, `bun install in ${relative(root, app)}`);
}

// A fresh copy of the fixture, installed, with @mk mapped to `mkUrl` (or no components.json).
async function freshApp(name: string, mkUrl: string | null): Promise<string> {
  const app = join(root, name);
  await cp(fixture, app, { recursive: true, filter: (source) => !source.split(sep).includes("node_modules") });
  const config = join(app, "components.json");
  if (mkUrl === null) await rm(config);
  else {
    const json = await readJson<{ registries: Record<string, string> }>(config);
    json.registries["@mk"] = mkUrl;
    await writeFile(config, `${JSON.stringify(json, null, 2)}\n`);
  }
  await install(app, `${name}-install`);
  return app;
}

async function build(app: string, label: string) {
  await expectOk(
    await exec([process.execPath, "run", "build"], { cwd: app, timeout: BUILD_TIMEOUT, label }),
    `bun run build in ${relative(root, app)}`,
  );
}

async function builtCss(app: string): Promise<string> {
  const assets = join(app, "dist/client/assets");
  const names = existsSync(assets) ? (await readdir(assets)).filter((name) => name.endsWith(".css")) : [];
  return (await Promise.all(names.map((name) => readFile(join(assets, name), "utf8")))).join("\n");
}

async function builtJs(app: string): Promise<string> {
  const assets = join(app, "dist/client/assets");
  const names = existsSync(assets) ? (await readdir(assets)).filter((name) => name.endsWith(".js")) : [];
  return (await Promise.all(names.map((name) => readFile(join(assets, name), "utf8")))).join("\n");
}

async function page(app: string, file: string): Promise<string> {
  const path = join(app, "dist/client", file);
  check(existsSync(path), `the build prerendered no ${file}`);
  return readFile(path, "utf8");
}

const DATA_MK = /data-mk=(?:"([^"]+)"|'([^']+)'|\{\s*["'`]([^"'`]+)["'`]\s*\})/g;

async function declaredMarks(app: string, files: string[]): Promise<string[]> {
  const marks = new Set<string>();
  for (const file of files) {
    if (!/\.tsx?$/.test(file)) continue;
    for (const match of (await readFile(join(app, file), "utf8")).matchAll(DATA_MK))
      marks.add((match[1] ?? match[2] ?? match[3])!);
  }
  return [...marks].sort();
}

async function snapshotFiles(app: string, files: string[]): Promise<Map<string, string>> {
  const contents = new Map<string, string>();
  for (const file of files) contents.set(file, await readFile(join(app, file), "utf8"));
  return contents;
}

// ---------------------------------------------------------------------------------------------
// steps

type Step = { step: number; name: string; ok: boolean; ms: number; skipped?: string; error?: string; detail: object };
const steps: Step[] = [];
// Steps whose app is usable by the steps after them even if a later assertion of theirs failed.
const ready = new Set<number>();

async function step(n: number, name: string, needs: number[], fn: (detail: Record<string, unknown>) => Promise<void>) {
  const detail: Record<string, unknown> = {};
  const unmet = needs.filter((k) => !ready.has(k) && !steps.find((s) => s.step === k)?.ok);
  if (unmet.length > 0) {
    steps.push({ step: n, name, ok: false, ms: 0, skipped: `needs step ${unmet.join(", ")}`, detail });
    console.log(`step ${n} ${name}: skipped (needs step ${unmet.join(", ")})`);
    return;
  }
  const started = performance.now();
  try {
    await fn(detail);
    const ms = Math.round(performance.now() - started);
    const skipped = typeof detail.skipped === "string" ? detail.skipped : undefined;
    if (skipped) delete detail.skipped;
    steps.push({ step: n, name, ok: true, ms, ...(skipped ? { skipped } : {}), detail });
    console.log(`step ${n} ${name}: ${skipped ? `skipped (${skipped})` : "ok"} in ${ms} ms`);
  } catch (error) {
    const ms = Math.round(performance.now() - started);
    const message =
      error instanceof Error
        ? error instanceof Failure
          ? error.message
          : (error.stack ?? error.message)
        : String(error);
    steps.push({ step: n, name, ok: false, ms, error: message, detail });
    console.log(`step ${n} ${name}: FAILED in ${ms} ms\n  ${message.split("\n").join("\n  ")}`);
  }
}

// ---------------------------------------------------------------------------------------------
// the init form, recorded once by --record and replayed by every other run

type InitForm = { cli: string; form: "existing-app" | "template"; args: string[]; env: Record<string, string> };

const initFormPath = join(mirror, "init-form.json");
const initEnv = { npm_config_user_agent: userAgent, SHADCN_TEMPLATE_DIR: "upstream/templates" };

function existingAppForm(cli: string): InitForm {
  return { cli, form: "existing-app", args: ["init", "<base>/r/init.json", "--base", "base", "-y"], env: initEnv };
}

function templateForm(cli: string): InitForm {
  return {
    cli,
    form: "template",
    args: [
      "init",
      "<base>/r/init.json",
      "--template",
      "start",
      "--base",
      "base",
      "--no-monorepo",
      "--name",
      "init-app",
    ],
    env: initEnv,
  };
}

// Runs one init form and returns the app it set up.
async function runInit(form: InitForm, label: string): Promise<{ app: string; ran: Ran }> {
  const args = form.args.map((arg) => arg.replaceAll("<base>", base));
  if (form.form === "existing-app") {
    const app = await freshApp(`${label}-app`, null);
    return { app, ran: await shadcn(args, app, label) };
  }
  const parent = join(root, `${label}-parent`);
  await mkdir(parent);
  const name = args[args.indexOf("--name") + 1]!;
  return { app: join(parent, name), ran: await shadcn(args, parent, label) };
}

async function initWorked(app: string, ran: Ran): Promise<string | null> {
  if (ran.code !== 0) return `exited ${ran.code} (log ${ran.log}):\n${tail(ran.out, 15)}`;
  const config = join(app, "components.json");
  if (!existsSync(config)) return "wrote no components.json";
  const mapped = (await readJson<{ registries?: Record<string, string> }>(config)).registries?.["@mk"];
  if (mapped !== `${base}/r/{name}.json`) return `components.json maps @mk to ${mapped}`;
  return null;
}

// ---------------------------------------------------------------------------------------------
// --refresh-lock

async function refreshLock() {
  root = await mkdtemp(join(tmpdir(), "mk-clean-room-"));
  try {
    await rm(logDir, { recursive: true, force: true });
    await mkdir(logDir, { recursive: true });
    const app = join(root, "lock");
    await cp(fixture, app, {
      recursive: true,
      filter: (source) => !source.split(sep).includes("node_modules") && !source.endsWith(`${sep}bun.lock`),
    });
    await install(app, "refresh-lock", false);
    await cp(join(app, "bun.lock"), join(fixture, "bun.lock"));
    console.log(`clean-room: wrote ${relative(pkg, join(fixture, "bun.lock"))}`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------
// the run

async function overlaySource(): Promise<string> {
  const git = async (...args: string[]) => {
    const ran = await exec(["git", ...args], { cwd: pkg, timeout: CLI_TIMEOUT, label: "git" });
    await expectOk(ran, `git ${args[0]}`);
    return ran.stdout.trim();
  };
  const top = await git("rev-parse", "--show-toplevel");
  const prefix = relative(top, pkg);
  const archive = join(root, "head.tar");
  const head = join(root, "head");
  await mkdir(head);
  await git("-C", top, "archive", "--format=tar", "-o", archive, "HEAD", "--", prefix);
  await expectOk(
    await exec(["tar", "-xf", archive, "-C", head], { cwd: root, timeout: CLI_TIMEOUT, label: "untar" }),
    "tar",
  );
  const source = join(head, prefix);
  for (const file of overlay) {
    const candidates = isAbsolute(file)
      ? [file]
      : [resolve(process.cwd(), file), resolve(top, file), resolve(pkg, file)];
    const found = candidates.find((path) => existsSync(path));
    check(found, `--overlay ${file} does not exist`);
    const rel = relative(pkg, found);
    check(rel.split(sep)[0] !== ".." && !isAbsolute(rel), `--overlay ${file} is outside packages/superthread`);
    await mkdir(dirname(join(source, rel)), { recursive: true });
    await cp(found, join(source, rel));
  }
  return source;
}

async function main(): Promise<boolean> {
  root = await mkdtemp(join(tmpdir(), "mk-clean-room-"));
  await rm(logDir, { recursive: true, force: true });
  await mkdir(logDir, { recursive: true });
  templateCopy = join(root, "templates");
  await cp(templates, templateCopy, { recursive: true });
  if (values.record) {
    await rm(mirror, { recursive: true, force: true });
    await mkdir(mirror, { recursive: true });
  } else await loadMirror();

  const cli = await cliVersion();
  const sourcePkg = { dir: pkg };
  const report: Record<string, unknown> = {
    cli: { ...cli, command: latest ? "bun x --bun shadcn@latest" : "packages/superthread/node_modules/.bin/shadcn" },
    record: values.record,
  };
  let step4Files = new Map<string, string>();
  let app = "";
  let allFiles: string[] = [];
  let initForm: InitForm | null = null;
  let styles: Record<string, unknown> | null = null;

  try {
    // 1. the registry under test
    await step(1, "build the registry", [], async (detail) => {
      if (siteBase) {
        base = siteBase;
        const init = await item("init");
        const mapped = init.config?.registries?.["@mk"];
        check(
          mapped === `${base}/r/{name}.json`,
          `${base}/r/init.json maps @mk to ${mapped}, not ${base}/r/{name}.json`,
        );
        detail.registry = base;
      } else {
        base = origin;
        if (overlay.length > 0) sourcePkg.dir = await overlaySource();
        const out = join(root, "registry");
        const ran = await exec(
          [
            process.execPath,
            join(sourcePkg.dir, "scripts/build-registry.ts"),
            ...["--out", out, "--base-url", base, "--shadcn", pinnedBin],
          ],
          { cwd: sourcePkg.dir, timeout: CLI_TIMEOUT, label: "build-registry" },
        );
        await expectOk(ran, "build-registry.ts");
        registryDir = join(out, "r");
        detail.registry = overlay.length > 0 ? "HEAD plus the overlay" : "the working tree";
        if (overlay.length > 0) detail.overlay = overlay;
      }
      version = (await readJson<{ version: string }>(join(sourcePkg.dir, "package.json"))).version;
      detail.version = version;
      detail.base = base;
    });

    // 2. the server (started above, so the build knows its port)
    await step(2, "serve /r and the counting /upstream mirror", [1], async (detail) => {
      const response = await fetch(`${base}/r/registry.json`);
      check(response.ok, `${base}/r/registry.json answered ${response.status}`);
      detail.origin = origin;
      detail.mirror = values.record ? `recording from ${upstreamOrigin}` : `${recorded.size} recorded requests`;
    });

    // 3. a fresh copy of the fixture, @mk mapped to the base under test
    await step(3, "copy and install the fixture", [1, 2], async () => {
      app = await freshApp("app", `${base}/r/{name}.json`);
    });

    // 4. tokens and the button
    await step(4, "add @mk/tokens @mk/button, then build", [3], async (detail) => {
      await expectOk(await shadcn(["add", "@mk/tokens", "@mk/button", "-y"], app, "add-tokens-button"), "add");
      const items = await closure(["tokens", "button"]);
      const files = checkPresent(app, items);
      check(
        files.every((file) => file.startsWith("src/components/superthread/")),
        "a file is outside src/components/superthread/",
      );
      step4Files = await snapshotFiles(app, files);
      ready.add(4);
      detail.items = items.map((entry) => entry.name).sort();
      detail.files = files;
      const css = await readFile(join(app, "src/styles.css"), "utf8");
      const lines = css.split("\n").map((line) => line.trim());
      for (const line of IMPORTS) {
        const count = lines.filter((l) => l === line).length;
        check(count === 1, `src/styles.css holds ${line} ${count} times`);
      }
      detail.styles = css;
      await build(app, "build-tokens-button");
      const html = await page(app, "index.html");
      check(html.includes('data-slot="button"'), 'prerendered / has no data-slot="button"');
      const button = await readFile(join(app, "src/components/superthread/ui/button.tsx"), "utf8");
      const branded = button.includes('data-mk="button"');
      if (branded)
        check(html.includes('data-mk="button"'), 'button.tsx declares data-mk="button", but / does not carry it');
      detail.dataMk = branded ? "declared and prerendered" : "not declared by the installed button";
      check((await builtCss(app)).includes("--primary:oklch("), "the built css has no --primary:oklch(");
      await checkStamps(app, items);
    });

    // 5. search
    await step(5, "search @mk lists every catalog item", [4], async (detail) => {
      const ran = await shadcn(["search", "@mk", "--json", "--limit", "1000"], app, "search");
      await expectOk(ran, "search");
      const json = JSON.parse(ran.stdout) as { items?: { name: string }[] };
      const listed = new Set((json.items ?? []).map((entry) => entry.name.replace(/^@mk\//, "")));
      const missing = catalog.map((entry) => entry.name).filter((name) => !listed.has(name));
      check(missing.length === 0, `search @mk does not list: ${missing.join(", ")}`);
      detail.listed = listed.size;
    });

    // 6. the same add again changes nothing
    await step(6, "re-add is a no-op", [4], async (detail) => {
      const before = await hashTree(app);
      await expectOk(await shadcn(["add", "@mk/tokens", "@mk/button", "-y"], app, "re-add"), "re-add");
      const differences = changed(before, await hashTree(app));
      check(differences.length === 0, `the re-add changed: ${differences.join(", ")}`);
      detail.files = before.size;
    });

    // 7. --diff reports no change, then reports a real one
    await step(7, "add --diff", [4], async (detail) => {
      const file = join(app, "src/components/superthread/ui/button.tsx");
      const clean = await shadcn(["add", "@mk/button", "--diff"], app, "diff-clean");
      await expectOk(clean, "add --diff");
      check(!clean.out.includes("+++ b/"), `add --diff showed a change on an untouched app (log ${clean.log})`);
      detail.clean = "shows no change";
      const original = await readFile(file, "utf8");
      const probe = "// clean-room diff probe";
      await writeFile(file, `${original}${probe}\n`);
      try {
        const dirty = await shadcn(["add", "@mk/button", "--diff"], app, "diff-dirty");
        check(dirty.out.includes(probe), `add --diff does not show the appended line (log ${dirty.log})`);
        detail.dirty = "shows the appended line";
      } finally {
        await writeFile(file, original);
      }
    });

    // 8. every item but init, and /all
    await step(8, "add every item and build /all and /blocks", [4], async (detail) => {
      const names = catalog.map((entry) => entry.name).filter((name) => name !== "init");
      await expectOk(await shadcn(["add", ...names.map((name) => `@mk/${name}`), "-y"], app, "add-all"), "add");
      const items = await closure(names);
      allFiles = checkPresent(app, items);
      ready.add(8);
      await cp(join(here, "all-items.tsx"), join(app, "src/routes/all.tsx"));
      await cp(join(here, "all-blocks.tsx"), join(app, "src/routes/blocks.tsx"));
      try {
        await build(app, "build-all");
      } finally {
        if (values.keep) {
          const kept = join(outDir, values.keep);
          await rm(kept, { recursive: true, force: true });
          await expectOk(await exec(["cp", "-a", app, kept], { cwd: root, timeout: CLI_TIMEOUT, label: "keep" }), "cp");
          detail.kept = relative(pkg, kept);
        }
      }
      const html = (await page(app, "all.html")) + (await page(app, "blocks.html"));
      const js = await builtJs(app);
      const marks = await declaredMarks(app, allFiles);
      const clientOnly: string[] = [];
      const absent: string[] = [];
      for (const mark of marks) {
        if (html.includes(`data-mk="${mark}"`)) continue;
        // a client-only value: the minifier writes the prop as a double- or single-quoted string or a template literal
        if (['"', "'", "`"].some((q) => js.includes(`"data-mk":${q}${mark}${q}`))) clientOnly.push(mark);
        else absent.push(mark);
      }
      check(absent.length === 0, `/all and /blocks carry no data-mk for: ${absent.join(", ")}`);
      detail.items = names.length;
      detail.files = allFiles.length;
      detail.dataMk = { declared: marks, prerendered: marks.filter((mark) => !clientOnly.includes(mark)), clientOnly };
      await checkStamps(app, items);
    });

    // 9. the branded files survive upstream's resets
    await step(9, "apply and init --reinstall leave the items alone", [8], async (detail) => {
      const before = await hashTree(app, "src/components/superthread");
      const keeps = async () => (await readFile(join(app, "src/styles.css"), "utf8")).includes(SUPERTHREAD_IMPORT);
      await expectOk(await shadcn(["apply", "nova", "-y"], app, "apply"), "apply nova");
      const afterApply = await hashTree(app, "src/components/superthread");
      const keptAfterApply = await keeps();
      await expectOk(
        await shadcn(["init", "--reinstall", "--preset", "nova", "--base", "base", "--force", "-y"], app, "reinstall"),
        "init --reinstall",
      );
      const afterReinstall = await hashTree(app, "src/components/superthread");
      const keptAfterReinstall = await keeps();
      styles = { keepsImportAfterApply: keptAfterApply, keepsImportAfterReinstall: keptAfterReinstall };
      detail.styles = styles;
      const byApply = changed(before, afterApply);
      const byReinstall = changed(afterApply, afterReinstall);
      check(byApply.length === 0, `apply nova changed: ${byApply.join(", ")}`);
      check(keptAfterApply, `apply nova left src/styles.css without ${SUPERTHREAD_IMPORT}`);
      check(byReinstall.length === 0, `init --reinstall changed: ${byReinstall.join(", ")}`);
      check(keptAfterReinstall, `init --reinstall left src/styles.css without ${SUPERTHREAD_IMPORT}`);
      detail.files = before.size;
    });

    // 10. init bootstraps @mk in a fresh app
    await step(10, "init", [1, 2], async (detail) => {
      let app10 = "";
      if (values.record) {
        const tried: Record<string, string> = {};
        for (const form of [existingAppForm(cli.version), templateForm(cli.version)]) {
          const { app: candidate, ran } = await runInit(form, `init-${form.form}`);
          const problem = await initWorked(candidate, ran);
          if (problem === null) {
            initForm = form;
            app10 = candidate;
            break;
          }
          tried[form.form] = problem;
        }
        check(initForm, `no init form worked:\n${JSON.stringify(tried, null, 2)}`);
        await writeFile(initFormPath, `${JSON.stringify(initForm, null, 2)}\n`);
        if (Object.keys(tried).length > 0) detail.tried = tried;
      } else {
        check(existsSync(initFormPath), `no ${relative(pkg, initFormPath)}; run --record once`);
        initForm = await readJson<InitForm>(initFormPath);
        const { app: candidate, ran } = await runInit(initForm, "init");
        const problem = await initWorked(candidate, ran);
        check(problem === null, `the recorded ${initForm.form} init form failed: ${problem}`);
        app10 = candidate;
      }
      detail.form = initForm!.form;
      const items = await closure(["tokens", "button"]);
      detail.files = checkPresent(app10, items);
      await build(app10, "build-init");
      await checkStamps(app10, items);
      if (initForm!.form === "template") {
        const lock = await readFile(join(app10, "bun.lock"), "utf8").catch(() => "");
        const resolved: Record<string, string> = {};
        for (const name of ["@tanstack/react-start", "@tanstack/react-router", "vite", "react", "@base-ui/react"]) {
          const match = lock.match(
            new RegExp(`"${name.replace("/", "\\/")}": \\["${name.replace("/", "\\/")}@([^"]+)"`),
          );
          if (match) resolved[name] = match[1]!;
        }
        detail.resolved = resolved;
      }
    });

    // 11. a pinned version installs the same files
    await step(11, "pinned version", [4], async (detail) => {
      const pinned = `${base}/r/v/${version}`;
      if (!(await fetch(`${pinned}/registry.json`)).ok) {
        detail.skipped = `no snapshot of ${version} at ${pinned}/`;
        return;
      }
      const app11 = await freshApp("pinned", `${pinned}/{name}.json`);
      await expectOk(await shadcn(["add", "@mk/button", "-y"], app11, "add-pinned"), "add");
      const items = await closure(["button"], pinned);
      const files = checkPresent(app11, items);
      await checkStamps(app11, items);
      const unseen = files.filter((file) => !step4Files.has(file));
      check(unseen.length === 0, `step 4 installed no ${unseen.join(", ")}`);
      const mismatched: string[] = [];
      for (const file of files)
        if ((await readFile(join(app11, file), "utf8")) !== step4Files.get(file)) mismatched.push(file);
      check(mismatched.length === 0, `the pinned files differ from step 4's: ${mismatched.join(", ")}`);
      detail.files = files;
    });

    // 12. every upstream request came from the mirror
    await step(12, "upstream requests", [], async (detail) => {
      const misses = served.filter((entry) => entry.from === "missing" || entry.status === 404);
      detail.paths = [...new Set(served.map((entry) => entry.path))].sort();
      check(misses.length === 0, `/upstream/** missed:\n  ${misses.map((entry) => entry.path).join("\n  ")}`);
    });
  } finally {
    server.stop(true);
    if (values.record) {
      const requests = [...recorded.values()].sort((a, b) => a.path.localeCompare(b.path));
      await writeFile(
        join(mirror, "requests.json"),
        `${JSON.stringify({ cli: cli.version, origin: upstreamOrigin, requests }, null, 2)}\n`,
      );
    }
  }

  // 13. the report
  const ok = steps.every((entry) => entry.ok);
  Object.assign(report, {
    ok,
    base,
    registry: siteBase ?? (overlay.length > 0 ? { overlay } : "working tree"),
    version,
    init: initForm,
    styles,
    upstream: {
      paths: [...new Set(served.map((entry) => entry.path))].sort(),
      misses: served.filter((entry) => entry.from === "missing").map((entry) => entry.path),
    },
    steps,
  });
  const json = `${JSON.stringify(report, null, 2)}\n`;
  await writeFile(join(outDir, "report.json"), json);
  if (values.keep) await writeFile(join(outDir, `${values.keep}.report.json`), json);
  console.log(`clean-room: ${ok ? "ok" : "FAILED"}; report in ${relative(pkg, join(outDir, "report.json"))}`);
  return ok;
}

async function run(): Promise<boolean> {
  try {
    if (!values["refresh-lock"]) return await main();
    await refreshLock();
    return true;
  } finally {
    server.stop(true);
    if (root) await rm(root, { recursive: true, force: true });
  }
}

process.exit((await run()) ? 0 : 1);
