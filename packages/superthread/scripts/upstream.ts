// The base-nova mirror: `bun scripts/upstream.ts <fetch | regen [--check] | print <name> | diff>`.
//
// `fetch` downloads every upstream item into `upstream/base-nova/` and records its sha256 in
// `upstream/manifest.json` (network, at authoring time only). `regen` writes the pass-through items from the
// vendored JSON; `--check` exits 1 when a written file would change. `print <name>` writes one transformed
// upstream file to stdout as a brand seed. `diff` compares a fresh fetch with the vendored copy, for upgrades.
//
// Transforms, in order: the `cn` package and `@/lib/utils` become our utils; registry hooks and lib paths, then
// ui paths, move under `@/components/superthread/`; `@/hooks/use-mobile` follows; `IconPlaceholder` becomes
// `Icon` from our glyphs by the table below; `"use client"` goes; upstream's style hooks become our utilities; served
// labels (an sr-only element's text, aria labels, titles, alt text, placeholders) go lowercase. `print` also strips
// the focus classes the stage 0 gate rules off every seeded control (build ruling 2). `regen` also applies each pass
// item's class table and fails on a style hook no rule maps. Anything a rule does not cover fails, so a new upstream
// import, icon, prop or class is a decision, never a silent drop.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

const pkg = join(import.meta.dir, "..");
const VENDORED = "upstream/base-nova";
const MANIFEST = "upstream/manifest.json";
const URL_TEMPLATE = "https://ui.shadcn.com/r/styles/base-nova/{name}.json";

/** Brand seeds: `print` writes each once, then its stage 4 slice owns the file. */
export const SEEDS = [
  "button",
  "badge",
  "input",
  "input-group",
  "textarea",
  "select",
  "dialog",
  "tabs",
  "table",
  "progress",
  "toast",
  "sidebar",
  "checkbox",
  "skeleton",
] as const;
/** Pass-through items. `utils` is vendored for provenance only: `items/lib/utils.ts` is written by hand. */
export const PASS = ["card", "label", "separator", "sheet", "tooltip", "use-mobile", "utils"] as const;
/** What `regen` writes. */
export const GENERATED = PASS.filter((name) => name !== "utils");
export const UPSTREAM = [...SEEDS, ...PASS];

/** The icon-library props upstream's `IconPlaceholder` takes, one icon name per library. All are dropped. */
export const ICON_LIBRARIES = ["lucide", "tabler", "hugeicons", "phosphor", "remixicon"];

/** Upstream icon (its `lucide=` name) to our glyph, with any class the mapping adds or drops. */
export const ICON_MAP: Record<string, { glyph: string; add?: string; drop?: string[] }> = {
  XIcon: { glyph: "close" },
  CheckIcon: { glyph: "check" },
  ChevronDownIcon: { glyph: "chevron" },
  ChevronUpIcon: { glyph: "chevron", add: "rotate-180" },
  ChevronRightIcon: { glyph: "chevron", add: "-rotate-90" },
  ChevronLeftIcon: { glyph: "left" },
  PanelLeftIcon: { glyph: "left" }, // no new drawing
  SearchIcon: { glyph: "search" },
  PlusIcon: { glyph: "plus" },
  CopyIcon: { glyph: "copy" },
  ArrowRightIcon: { glyph: "arrow" },
  TrashIcon: { glyph: "trash" },
  CircleCheckIcon: { glyph: "tick" }, // success is done
  InfoIcon: { glyph: "i" }, // info is running
  TriangleAlertIcon: { glyph: "pause" }, // warning is waiting (round 2 ruling 7)
  OctagonXIcon: { glyph: "cross" }, // error is failed
  Loader2Icon: { glyph: "i", drop: ["animate-spin"] }, // loading shows as running, static, no spin
};

/**
 * Upstream's style hooks (`cn-*` classes, which shadcn's own style sheet defines and ours does not) to the utilities
 * that carry them here. `regen` fails on a hook this table does not map, so no pass item names an undefined class.
 */
export const STYLE_HOOKS: Record<string, string[]> = {
  "cn-font-heading": ["font-display"],
};

/**
 * Per pass item, an upstream class word and the words that replace it. A word the upstream file no longer carries
 * fails `regen`, so the table cannot go stale silently.
 */
export const PASS_CLASSES: Record<string, Record<string, string[]>> = {
  // a bare `transition` also fades outline-color, so the close button's focus ring would fade in with the popup;
  // the popup moves only these two
  sheet: { transition: ["transition-[opacity,translate]"] },
};

/** JSX attributes whose string value is served as words. */
export const LABEL_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "title",
  "alt",
  "placeholder",
];

const UTILS = "@/components/superthread/lib/utils";
const GLYPHS_MODULE = "@/components/superthread/ui/glyphs";
const ICON_PLACEHOLDER = "@/app/(create)/components/icon-placeholder";

type UpstreamFile = { path: string; type: string; content: string };
type UpstreamItem = { name: string; type: string; files: UpstreamFile[] };
type Manifest = { cli: string; fetched: string; url: string; files: Record<string, string> };

const sha256 = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const urlOf = (name: string) => URL_TEMPLATE.replace("{name}", name);

/** The glyph names the generated `glyphs.tsx` draws, from the vendored master. */
function glyphNames(): Set<string> {
  const glyphs = JSON.parse(readFileSync(join(pkg, "tokens/glyphs.json"), "utf8"));
  return new Set([...Object.keys(glyphs.ICONS), ...Object.keys(glyphs.GLYPHS)]);
}

// ---- transforms ----

/** Module specifiers in static imports, re-exports, side-effect imports and dynamic imports. */
const SPECIFIER = /(\bfrom\s+|^\s*import\s+|\bimport\s*\(\s*)(["'])([^"'\n]+)\2/gm;

/** Transforms 1 to 4: where an upstream import lands in the package. */
export function rewriteSpecifier(spec: string): string {
  if (spec === "cn" || spec === "@/lib/utils") return UTILS;
  let m = spec.match(/^@\/registry\/(?:.+\/)?hooks\/([^/]+)$/);
  if (m) return `@/components/superthread/hooks/${m[1]}`;
  m = spec.match(/^@\/registry\/(?:.+\/)?lib\/([^/]+)$/);
  if (m) return `@/components/superthread/lib/${m[1]}`;
  m = spec.match(/^@\/registry\/(?:.+\/)?ui\/([^/]+)$/) ?? spec.match(/^@\/components\/ui\/([^/]+)$/);
  if (m) return `@/components/superthread/ui/${m[1]}`;
  if (spec === "@/hooks/use-mobile") return "@/components/superthread/hooks/use-mobile";
  return spec;
}

/** One JSX attribute as written: `name`, `name="..."` or `name={...}`. */
type Attr = { name: string; text?: string; expr?: string };

/** Parses the attributes of a self-closing element from `at` (just past its tag name) to its `/>`. */
function parseAttrs(src: string, at: number, where: string): { attrs: Attr[]; end: number } {
  const attrs: Attr[] = [];
  let i = at;
  const fail = (why: string): never => {
    throw new Error(`${where}: IconPlaceholder ${why} near ${JSON.stringify(src.slice(i, i + 40))}`);
  };
  for (;;) {
    while (/\s/.test(src[i] ?? "")) i++;
    if (src.startsWith("/>", i)) return { attrs, end: i + 2 };
    if (src[i] === ">") fail("has children, which the transform does not take");
    if (src[i] === "{") fail("takes a spread, which the transform does not take");
    const name = src.slice(i).match(/^[A-Za-z_][\w:.-]*/)?.[0];
    if (!name) fail("has an attribute the transform cannot read");
    i += name!.length;
    if (src[i] !== "=") {
      attrs.push({ name: name! });
      continue;
    }
    i++;
    const quote = src[i];
    if (quote === '"' || quote === "'") {
      const close = src.indexOf(quote, i + 1);
      if (close < 0) fail("has an unterminated string");
      attrs.push({ name: name!, text: src.slice(i + 1, close) });
      i = close + 1;
    } else if (quote === "{") {
      let depth = 0;
      const start = i;
      for (; i < src.length; i++) {
        const c = src[i];
        if (c === '"' || c === "'" || c === "`") {
          const close = src.indexOf(c, i + 1);
          if (close < 0) fail("has an unterminated string");
          i = close;
        } else if (c === "{") depth++;
        else if (c === "}" && --depth === 0) break;
      }
      if (depth !== 0) fail("has an unbalanced expression");
      attrs.push({ name: name!, expr: src.slice(start + 1, i) });
      i++;
    } else fail(`gives ${name} a value the transform cannot read`);
  }
}

/** Transform 5: `<IconPlaceholder lucide="X" ... />` becomes `<Icon name="<glyph>" ... />`. */
function replaceIcons(src: string, where: string, glyphs: Set<string>): string {
  const tag = "<IconPlaceholder";
  let out = "";
  let from = 0;
  for (let at = src.indexOf(tag); at >= 0; at = src.indexOf(tag, from)) {
    if (/[\w.]/.test(src[at + tag.length] ?? "")) throw new Error(`${where}: unknown tag at ${at}`);
    const { attrs, end } = parseAttrs(src, at + tag.length, where);
    const lucide = attrs.find((a) => a.name === "lucide");
    if (!lucide?.text) throw new Error(`${where}: an IconPlaceholder has no lucide= name`);
    const map = ICON_MAP[lucide.text];
    if (!map) throw new Error(`${where}: upstream icon ${lucide.text} has no glyph in the icon table`);
    if (!glyphs.has(map.glyph)) throw new Error(`${where}: glyph ${map.glyph} is not in tokens/glyphs.json`);

    const kept: string[] = [];
    let className: Attr | undefined;
    for (const a of attrs) {
      if (ICON_LIBRARIES.includes(a.name)) continue;
      if (a.name === "className") className = a;
      else if (a.name.startsWith("aria-")) kept.push(writeAttr(a));
      else throw new Error(`${where}: IconPlaceholder prop ${a.name} is neither an icon library, className nor aria-*`);
    }
    let cls = "";
    if (className?.expr !== undefined) {
      if (map.drop?.length) throw new Error(`${where}: cannot drop ${map.drop} from a className expression`);
      cls = map.add ? ` className={cn("${map.add}", ${className.expr})}` : ` className={${className.expr}}`;
    } else {
      const words = [map.add, ...(className?.text ?? "").split(/\s+/)].filter(
        (w): w is string => !!w && !map.drop?.includes(w),
      );
      if (words.length) cls = ` className="${words.join(" ")}"`;
    }
    out += src.slice(from, at) + `<Icon name="${map.glyph}"${cls}${kept.map((k) => ` ${k}`).join("")} />`;
    from = end;
  }
  return out + src.slice(from);
}

const writeAttr = (a: Attr) =>
  a.text !== undefined ? `${a.name}="${a.text}"` : a.expr !== undefined ? `${a.name}={${a.expr}}` : a.name;

/** Splits a class token into its variants and its utility, at the colons outside brackets and parentheses. */
function utilityOf(token: string): string {
  let depth = 0;
  let last = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) last = i + 1;
  }
  return token.slice(last).replace(/^!/, "").replace(/!$/, "");
}

/**
 * Build ruling 2: no seeded control carries `outline-none` or `outline-hidden` (in Tailwind 4.3.3 each sets
 * `outline-style: none`, which nulls the base ring and `outline-2`), under any variant, nor a `ring-*` class,
 * `focus-visible:outline-1` or a focus `border-ring`. `outline-0` stays: it sets only the width, and the text
 * control inside a field keeps it.
 */
export function isStrippedFocusClass(token: string): boolean {
  const u = utilityOf(token);
  if (u === "outline-none" || u === "outline-hidden") return true;
  if (u === "ring" || u.startsWith("ring-")) return true;
  return (u === "outline-1" || u === "border-ring") && token.includes("focus");
}

/** A one-line string literal in single or double quotes: where class words live. */
const LITERAL = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g;

/** Rewrites the words of every string literal: `map` returns a word's replacement words, or undefined to keep it. */
function mapClassWords(src: string, map: (word: string) => string[] | undefined): string {
  return src.replace(LITERAL, (lit) => {
    const quote = lit[0]!;
    const words = lit.slice(1, -1).split(/\s+/).filter(Boolean);
    let changed = false;
    const out = words.flatMap((word) => {
      const replaced = map(word);
      if (replaced === undefined) return [word];
      changed = true;
      return replaced;
    });
    return changed ? `${quote}${out.join(" ")}${quote}` : lit;
  });
}

/** The seed transform: drops the ruled focus classes from every class string in the file. */
function stripFocusClasses(src: string): string {
  return mapClassWords(src, (word) => (isStrippedFocusClass(word) ? [] : undefined));
}

/** Upstream's style hooks become our utilities; a pass item also takes its class table, every entry of which must hit. */
function mapClasses(src: string, where: string, pass: string | undefined): string {
  const table = (pass && PASS_CLASSES[pass]) || {};
  const hit = new Set<string>();
  const out = mapClassWords(src, (word) => {
    if (Object.hasOwn(table, word)) {
      hit.add(word);
      return table[word];
    }
    return Object.hasOwn(STYLE_HOOKS, word) ? STYLE_HOOKS[word] : undefined;
  });
  const stale = Object.keys(table).filter((word) => !hit.has(word));
  if (stale.length)
    throw new Error(`${where}: the pass class table names ${stale.join(", ")}, which upstream no longer has`);
  return out;
}

/** Served labels go lowercase: string values of the label attributes, and the text of an sr-only element. */
function lowercaseLabels(src: string): string {
  const attribute = new RegExp(`(\\s(?:${LABEL_ATTRIBUTES.join("|")})=)(["'])([^"'\\n]*)\\2`, "g");
  return src
    .replace(
      attribute,
      (_, name: string, quote: string, text: string) => `${name}${quote}${text.toLowerCase()}${quote}`,
    )
    .replace(
      /(className=(["'])(?:[^"'\n]*\s)?sr-only(?:\s[^"'\n]*)?\2[^<>]*>)([^<{]*)(?=<)/g,
      (_, open: string, _quote: string, text: string) => `${open}${text.toLowerCase()}`,
    );
}

/** Transforms 1 to 8, in order; `seed` adds the seed transform (`print`), `pass` names the pass item `regen` writes. */
export function transform(content: string, where: string, opts: { seed?: boolean; pass?: string } = {}): string {
  let src = content;
  let usesIcons = false;
  src = src.replace(SPECIFIER, (all, lead: string, q: string, spec: string) => {
    if (spec === ICON_PLACEHOLDER) {
      usesIcons = true;
      return `${lead}${q}${GLYPHS_MODULE}${q}`;
    }
    return `${lead}${q}${rewriteSpecifier(spec)}${q}`;
  });
  if (usesIcons) {
    src = src.replace(
      new RegExp(`import\\s*\\{\\s*IconPlaceholder\\s*\\}\\s*from\\s*(["'])${GLYPHS_MODULE}\\1`),
      `import { Icon } from "${GLYPHS_MODULE}"`,
    );
    src = replaceIcons(src, where, glyphNames());
  }
  src = src.replace(/^(["'])use client\1;?[ \t]*\n(?:[ \t]*\n)?/, "");
  src = mapClasses(src, where, opts.pass);
  src = lowercaseLabels(src);
  if (opts.seed) src = stripFocusClasses(src);

  if (opts.pass) {
    const words = [...src.matchAll(LITERAL)].flatMap(([lit]) => lit.slice(1, -1).split(/\s+/));
    const hooks = [...new Set(words.filter((word) => utilityOf(word).startsWith("cn-")))];
    if (hooks.length) throw new Error(`${where}: style hook ${hooks.join(", ")} has no rule in STYLE_HOOKS`);
  }
  for (const m of src.matchAll(SPECIFIER)) {
    const spec = m[3]!;
    if (/^@\/(registry|app|lib|hooks|components\/ui)\//.test(spec) || spec === "@/lib/utils")
      throw new Error(`${where}: import ${spec} has no rule`);
    if (spec === "lucide-react" || spec.startsWith("@phosphor-icons/") || spec === "cn")
      throw new Error(`${where}: import ${spec} must not reach an item`);
  }
  if (/\bIconPlaceholder\b/.test(src)) throw new Error(`${where}: IconPlaceholder remains`);
  if (/^\s*(["'])use client\1/m.test(src)) throw new Error(`${where}: "use client" remains`);
  return src;
}

// ---- the vendored copy ----

function readItem(name: string): UpstreamItem {
  const file = join(pkg, VENDORED, `${name}.json`);
  if (!existsSync(file)) throw new Error(`${VENDORED}/${name}.json is missing; run fetch`);
  return JSON.parse(readFileSync(file, "utf8"));
}

function readManifest(): Manifest {
  return JSON.parse(readFileSync(join(pkg, MANIFEST), "utf8"));
}

/** Where an upstream file lands under `items/`, by its registry type. */
export function itemPath(file: UpstreamFile): string {
  const kind = { "registry:ui": "ui", "registry:hook": "hooks", "registry:lib": "lib" }[file.type];
  if (!kind) throw new Error(`${file.path}: no items/ directory for type ${file.type}`);
  return `items/${kind}/${basename(file.path)}`;
}

/** The pass-through files `regen` writes, keyed by package-relative path. */
export function passFiles(): Map<string, string> {
  const out = new Map<string, string>();
  for (const name of GENERATED)
    for (const file of readItem(name).files)
      out.set(itemPath(file), transform(file.content, `${name}: ${file.path}`, { pass: name }));
  return out;
}

/** The manifest's hashes against the vendored files: the names that differ, are missing or are extra. */
export function manifestDrift(): string[] {
  const { files } = readManifest();
  const present = existsSync(join(pkg, VENDORED))
    ? readdirSync(join(pkg, VENDORED)).filter((f) => f.endsWith(".json"))
    : [];
  const drift: string[] = [];
  for (const name of UPSTREAM) {
    const file = join(pkg, VENDORED, `${name}.json`);
    if (!files[name]) drift.push(`${name}: not in the manifest`);
    else if (!existsSync(file)) drift.push(`${name}: missing`);
    else if (sha256(readFileSync(file)) !== files[name]) drift.push(`${name}: sha256 differs from the manifest`);
  }
  for (const name of Object.keys(files))
    if (!(UPSTREAM as readonly string[]).includes(name)) drift.push(`${name}: in the manifest, not upstream`);
  for (const f of present)
    if (!(UPSTREAM as readonly string[]).includes(f.slice(0, -5))) drift.push(`${f}: vendored, not upstream`);
  return drift;
}

// ---- commands ----

async function download(name: string): Promise<Uint8Array> {
  const res = await fetch(urlOf(name));
  if (!res.ok) throw new Error(`${urlOf(name)}: HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const item = JSON.parse(new TextDecoder().decode(bytes)) as UpstreamItem;
  if (item.name !== name) throw new Error(`${urlOf(name)}: names itself ${item.name}`);
  return bytes;
}

async function fetchAll(): Promise<number> {
  const cliPkg = join(pkg, "node_modules/shadcn/package.json");
  if (!existsSync(cliPkg)) throw new Error("packages/superthread/node_modules/shadcn is not installed");
  const cli = JSON.parse(readFileSync(cliPkg, "utf8")).version as string;
  const dir = join(pkg, VENDORED);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files: Record<string, string> = {};
  for (const name of [...UPSTREAM].sort()) {
    const bytes = await download(name);
    writeFileSync(join(dir, `${name}.json`), bytes);
    files[name] = sha256(bytes);
    console.log(`fetched ${name}`);
  }
  const manifest: Manifest = { cli, fetched: new Date().toISOString().slice(0, 10), url: URL_TEMPLATE, files };
  writeFileSync(join(pkg, MANIFEST), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${MANIFEST} (shadcn ${cli})`);
  return 0;
}

function regen(check: boolean): number {
  const drift = manifestDrift();
  if (drift.length) {
    for (const d of drift) console.error(`manifest: ${d}`);
    return 1;
  }
  let differ = 0;
  for (const [rel, content] of passFiles()) {
    const file = join(pkg, rel);
    const same = existsSync(file) && readFileSync(file, "utf8") === content;
    if (check) {
      if (!same) {
        console.error(`DIFF ${rel}`);
        differ++;
      }
    } else if (!same) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
      console.log(`wrote ${rel}`);
    }
  }
  if (check) console.log(differ ? `regen --check: ${differ} file(s) differ` : "regen --check: all match");
  return differ ? 1 : 0;
}

function print(name: string | undefined): number {
  if (!name || !(UPSTREAM as readonly string[]).includes(name)) {
    console.error(`usage: bun scripts/upstream.ts print <${UPSTREAM.join(" | ")}>`);
    return 2;
  }
  const { files } = readItem(name);
  if (files.length !== 1) throw new Error(`${name} has ${files.length} files; print takes one`);
  process.stdout.write(transform(files[0]!.content, `${name}: ${files[0]!.path}`, { seed: true }));
  return 0;
}

async function diff(): Promise<number> {
  const scratch = mkdtempSync(join(tmpdir(), "upstream-diff-"));
  let changed = 0;
  try {
    for (const name of [...UPSTREAM].sort()) {
      const fresh = await download(name);
      const file = join(pkg, VENDORED, `${name}.json`);
      const old = existsSync(file) ? readFileSync(file) : undefined;
      if (old && sha256(old) === sha256(fresh)) continue;
      changed++;
      if (!old) {
        console.log(`${name}: not vendored`);
        continue;
      }
      // compare the file contents, which is what a seed or pass item is made from
      const show = (bytes: Uint8Array, side: string) => {
        const item = JSON.parse(new TextDecoder().decode(bytes)) as UpstreamItem;
        const text = item.files.map((f) => `// ${f.path} (${f.type})\n${f.content}`).join("\n");
        const rest = JSON.stringify({ ...item, files: item.files.map((f) => f.path) }, null, 2);
        const out = join(scratch, `${name}.${side}`);
        writeFileSync(out, `${rest}\n${text}`);
        return out;
      };
      const run = Bun.spawnSync(["diff", "-u", show(old, "vendored"), show(fresh, "fresh")], { stdout: "pipe" });
      console.log(`${name}: changed`);
      process.stdout.write(run.stdout);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  console.log(changed ? `diff: ${changed} item(s) changed upstream` : "diff: the vendored copy is current");
  return changed ? 1 : 0;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command === "fetch") return fetchAll();
  if (command === "regen") return regen(rest.includes("--check"));
  if (command === "print") return print(rest[0]);
  if (command === "diff") return diff();
  console.error("usage: bun scripts/upstream.ts <fetch | regen [--check] | print <name> | diff>");
  return 2;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
