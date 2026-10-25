import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { contrast, de, hexToOklch, oklchToHex, tint } from "./color.ts";

const pkg = resolve(import.meta.dir, "..");
const repo = resolve(pkg, "../..");
const publicMarks = join(repo, "apps/superthread/public/marks");
const manifestPath = join(pkg, "marks/fleet.json");
const fleetPath = join(pkg, "items/lib/fleet.ts");
const KEY = "#16181d";
const PAPER = "#ffffff";
const modes = ["light", "dark"] as const;
type Mode = (typeof modes)[number];
type Pair = Record<Mode, string>;
export type MarkShip = {
  id: string;
  name: string;
  desc: string;
  target: "soliton" | "cloudflare";
  url: string | null;
  angle: number;
  spot: Pair;
  mark: Pair;
  kind: "master" | "star" | "glyph";
  home?: boolean;
};
type Manifest = { schema: 1; fleet: MarkShip[] };
type Provenance = { files: Record<string, { source: string; sha256: string }>; [key: string]: unknown };
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const read = (file: string) => readFileSync(file, "utf8");
const slug = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function baseUrl(value: string): string {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash)
    throw new Error("url must be an http(s) base URL without credentials, query or fragment");
  return url.href.replace(/\/$/, "");
}

export function loadFleet(): Manifest {
  const manifest = JSON.parse(read(manifestPath)) as Manifest;
  if (manifest.schema !== 1 || !Array.isArray(manifest.fleet))
    throw new Error("marks/fleet.json: expected schema 1 and fleet array");
  const ids = new Set<string>();
  const angles = new Set<number>();
  for (const ship of manifest.fleet) {
    if (!slug.test(ship.id) || ids.has(ship.id)) throw new Error(`invalid or duplicate ship id: ${ship.id}`);
    ids.add(ship.id);
    if (!ship.name?.trim() || !ship.desc?.trim()) throw new Error(`${ship.id}: name and desc are required`);
    if (!["soliton", "cloudflare"].includes(ship.target)) throw new Error(`${ship.id}: invalid target`);
    if (ship.url !== null && baseUrl(ship.url) !== ship.url) throw new Error(`${ship.id}: url must be normalized`);
    if (!Number.isInteger(ship.angle) || ship.angle < 0 || ship.angle >= 180 || angles.has(ship.angle))
      throw new Error(`${ship.id}: angle must be unique, 0 to 179`);
    angles.add(ship.angle);
    if (!["master", "star", "glyph"].includes(ship.kind)) throw new Error(`${ship.id}: invalid kind`);
    for (const mode of modes) {
      if (ship.mark[mode] !== `${ship.id}${mode === "dark" ? "-dark" : ""}.svg`)
        throw new Error(`${ship.id}: invalid ${mode} mark filename`);
      if (!/^#[0-9a-f]{6}$/.test(ship.spot[mode])) throw new Error(`${ship.id}: invalid ${mode} spot`);
    }
  }
  if (manifest.fleet.filter((ship) => ship.home).length !== 1) throw new Error("fleet needs exactly one home mark");
  return manifest;
}

// Hosts belong to the manifest, not to a registry item installed in somebody else's app.
export function fleetSource(manifest: Manifest): string {
  const fleet = manifest.fleet
    .filter((ship) => !ship.home)
    .map(({ id, name, desc, angle, mark }) => ({ id, name, desc, angle, mark }));
  return `// the fleet, in its order: generated from marks/fleet.json; edit the manifest, then run bun run build in packages/superthread\n// desc is the line under a ship's name in the rail's tab. Each mark is a file name under the consumer's mark base;\n// hrefs are the consumer's.\n\nexport const fleet = ${JSON.stringify(fleet, null, 2)} as const\n\nexport type Ship = (typeof fleet)[number]\nexport type ShipId = Ship["id"]\n`;
}

// Same integer run paths as the master world's common.mark_svg. A new star is a screened hue tile with one dot.
function starSvg(ship: MarkShip, mode: Mode): string {
  const ink = mode === "light" ? KEY : PAPER;
  const stock = mode === "light" ? PAPER : KEY;
  const byColour = new Map<string, string[]>();
  for (let y = 0; y < 16; y++) {
    const row = Array.from({ length: 16 }, (_, x) => {
      if ((x === 0 || x === 15) && (y === 0 || y === 15)) return null;
      if ((x === 7 || x === 8) && (y === 7 || y === 8)) return ink;
      return (x + y) % 2 === 0 ? ship.spot[mode] : stock;
    });
    for (let x = 0; x < 16;) {
      const colour = row[x];
      let n = 1;
      while (x + n < 16 && row[x + n] === colour) n++;
      if (colour) {
        if (!byColour.has(colour)) byColour.set(colour, []);
        byColour.get(colour)!.push(`M${x} ${y}h${n}v1h-${n}z`);
      }
      x += n;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">${[...byColour].map(([colour, paths]) => `<path fill="${colour}" d="${paths.join("")}"/>`).join("")}</svg>\n`;
}

// Read exactly the master's SVG language back as 256 cells. Reject subpixel edges, overlap and hidden content.
function pixels(svg: string): (string | null)[] {
  const body =
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">(.*)<\/svg>\s*$/.exec(
      svg,
    )?.[1];
  if (!body) throw new Error("expected a crisp 16x16 SVG in the master mark format");
  const cells: (string | null)[] = Array(256).fill(null);
  let consumed = "";
  for (const match of body.matchAll(/<path fill="(#[0-9a-f]{6})" d="([^"]+)"\/>/g)) {
    consumed += match[0];
    let path = "";
    for (const run of match[2]!.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)) {
      path += run[0];
      const [x, y, width, back] = run.slice(1).map(Number) as [number, number, number, number];
      if (width < 1 || width !== back || x + width > 16 || y > 15) throw new Error("path escapes the 16px grid");
      for (let dx = 0; dx < width; dx++) {
        const at = y * 16 + x + dx;
        if (cells[at] !== null) throw new Error("overlapping mark pixels");
        cells[at] = match[1]!;
      }
    }
    if (path !== match[2]) throw new Error("mark paths must be integer horizontal pixel runs");
  }
  if (consumed !== body) throw new Error("unsupported SVG content");
  for (let i = 0; i < 256; i++) {
    const corner = [0, 15, 240, 255].includes(i);
    if (corner !== (cells[i] === null)) throw new Error("mark must fill its tile with four 1px corner notches");
  }
  return cells;
}

function validate(manifest: Manifest, overrides = new Map<string, string>()): void {
  const provenance = JSON.parse(read(join(publicMarks, "PROVENANCE.json"))) as Provenance;
  const masks: string[] = [];
  for (const ship of manifest.fleet) {
    const modeMasks: string[] = [];
    for (const mode of modes) {
      const relative = `${ship.id}/${ship.mark[mode]}`;
      const svg = overrides.get(relative) ?? read(join(publicMarks, relative));
      if (!overrides.has(relative) && provenance.files[relative]?.sha256 !== sha(svg))
        throw new Error(`${relative}: provenance sha256 differs`);
      if (ship.kind === "star" && svg !== starSvg(ship, mode))
        throw new Error(`${relative}: star differs from manifest`);
      const cells = pixels(svg);
      if (cells.some((c) => c !== null && ![KEY, PAPER, ship.spot[mode]].includes(c)))
        throw new Error(`${relative}: colour outside key, paper and spot`);
      const tile = mode === "light" ? KEY : PAPER;
      const glyph = mode === "light" ? PAPER : KEY;
      const dot = ship.kind === "star" ? tile : glyph;
      if (cells.filter((c) => c === dot).length < 4 || !cells.includes(ship.spot[mode]))
        throw new Error(`${relative}: silhouette or spot disappears at 16px`);
      // 50% checker mixes in linear light, as in the master's contrast checks.
      if (contrast(tint(ship.spot[mode], glyph, 50), tile) < 3)
        throw new Error(`${relative}: screened region below 3:1 contrast`);
      const home = manifest.fleet.find((s) => s.home)!;
      if (!ship.home && de(ship.spot[mode], home.spot[mode]) < 10)
        throw new Error(`${relative}: spot too close to house plum`);
      const mask = cells.map((c) => (c === null ? "." : c === dot ? "#" : "-")).join("");
      modeMasks.push(mask);
    }
    if (modeMasks[0] !== modeMasks[1]) throw new Error(`${ship.id}: silhouette differs between chromes`);
    if (ship.kind !== "star" && masks.includes(modeMasks[0]!)) throw new Error(`${ship.id}: duplicate silhouette`);
    if (ship.kind !== "star") masks.push(modeMasks[0]!);
  }
  // Ten OKLab points is the brand's separation floor. Apply it in both modes; never silently reuse a hue.
  for (let i = 0; i < manifest.fleet.length; i++)
    for (const b of manifest.fleet.slice(i + 1))
      for (const mode of modes)
        if (de(manifest.fleet[i]!.spot[mode], b.spot[mode]) < 10)
          throw new Error(`${manifest.fleet[i]!.id}/${b.id}: ${mode} spots too close`);
}

function check(manifest: Manifest): void {
  validate(manifest);
  if (read(fleetPath) !== fleetSource(manifest))
    throw new Error("items/lib/fleet.ts is stale; run bun run build in packages/superthread");
  if (read(join(publicMarks, "fleet.json")) !== read(manifestPath))
    throw new Error("public marks/fleet.json differs from manifest");
}

function write(file: string, content: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function receipt(ship: MarkShip) {
  return {
    id: ship.id,
    target: ship.target,
    url: ship.url,
    manifest: "packages/superthread/marks/fleet.json",
    mark: Object.fromEntries(
      modes.map((mode) => [mode, `apps/superthread/public/marks/${ship.id}/${ship.mark[mode]}`]),
    ),
  };
}

function newShip(manifest: Manifest, id: string, options: Map<string, string>): void {
  if (!slug.test(id) || id.length > 63) throw new Error("id must be a lowercase kebab slug, at most 63 characters");
  const target = options.get("--target") ?? "cloudflare";
  if (target !== "soliton" && target !== "cloudflare") throw new Error("target must be soliton or cloudflare");
  const suppliedUrl = options.get("--url") ?? `https://${id}.mauricekleine.com`;
  const url = suppliedUrl === "none" ? null : baseUrl(suppliedUrl);
  const name = options.get("--label") ?? id;
  if (!name.trim()) throw new Error("label must not be empty");
  check(manifest);
  const existing = manifest.fleet.find((ship) => ship.id === id);
  if (existing) {
    if (existing.target !== target || existing.url !== url || existing.name !== name)
      throw new Error(`${id}: existing metadata conflicts`);
    emitReceipt(existing, options.get("--receipt"));
    return;
  }
  // Fixed 15-degree slots make allocation reproducible. Revisit the palette when all valid slots are occupied.
  let spot: Pair | undefined;
  for (let hue = 0; hue < 360; hue += 15) {
    const candidate = { light: oklchToHex(0.72, 0.16, hue), dark: oklchToHex(0.68, 0.14, hue) };
    if (
      modes.every((mode) => {
        const L = hexToOklch(candidate[mode])[0];
        return (
          L >= 0.6 &&
          L <= 0.8 &&
          contrast(tint(candidate[mode], mode === "light" ? PAPER : KEY, 50), mode === "light" ? KEY : PAPER) >= 3 &&
          manifest.fleet.every((ship) => de(candidate[mode], ship.spot[mode]) >= 10)
        );
      })
    ) {
      spot = candidate;
      break;
    }
  }
  if (!spot) throw new Error("no distinct hue slot remains; draw a glyph and extend the palette deliberately");
  const angle = Array.from({ length: 180 }, (_, i) => i).find((n) => !manifest.fleet.some((s) => s.angle === n))!;
  const ship: MarkShip = {
    id,
    name,
    desc: "a new star",
    target,
    url,
    angle,
    spot,
    mark: { light: `${id}.svg`, dark: `${id}-dark.svg` },
    kind: "star",
  };
  const next: Manifest = { schema: 1, fleet: [...manifest.fleet, ship] };
  const svgs = new Map(modes.map((mode) => [`${id}/${ship.mark[mode]}`, starSvg(ship, mode)]));
  for (const file of svgs.keys())
    if (existsSync(join(publicMarks, file))) throw new Error(`${file}: unregistered asset already exists`);
  validate(next, svgs);
  const provenance = JSON.parse(read(join(publicMarks, "PROVENANCE.json"))) as Provenance;
  for (const [file, svg] of svgs) {
    write(join(publicMarks, file), svg);
    provenance.files[file] = { source: "packages/superthread/marks/fleet.json (scripts/marks.ts)", sha256: sha(svg) };
  }
  write(fleetPath, fleetSource(next));
  write(join(publicMarks, "PROVENANCE.json"), json(provenance));
  write(join(publicMarks, "fleet.json"), json(next));
  write(manifestPath, json(next));
  emitReceipt(ship, options.get("--receipt"));
}

function emitReceipt(ship: MarkShip, out?: string): void {
  const content = JSON.stringify(receipt(ship));
  if (out) write(resolve(out), content + "\n");
  console.log(content);
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function sheet(manifest: Manifest, out: string): void {
  check(manifest);
  const rows = manifest.fleet
    .map(
      (ship) =>
        `<tr><th scope="row">${escape(ship.name)}<small>${escape(ship.kind)} · ${escape(ship.spot.light)} / ${escape(ship.spot.dark)}</small></th>${modes.map((mode) => `<td class="${mode}">${[16, 32, 48].map((size) => `<img alt="${escape(ship.name)} ${mode}, ${size} pixels" width="${size}" height="${size}" src="data:image/svg+xml;base64,${Buffer.from(read(join(publicMarks, ship.id, ship.mark[mode]))).toString("base64")}">`).join("")}</td>`).join("")}</tr>`,
    )
    .join("\n");
  write(
    out,
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>fleet marks</title><style>body{margin:24px;background:#fff;color:#16181d;font:16px system-ui}h1{font-size:24px;font-weight:500}table{border-collapse:collapse}th,td{border:1px solid #888;padding:16px;text-align:left}small{display:block;font-size:12px;font-weight:400;margin-top:8px}td{white-space:nowrap}.light{background:#fff}.dark{background:#16181d}img{vertical-align:middle;image-rendering:pixelated;margin-right:20px}img:last-child{margin:0}</style><h1>fleet marks</h1><p>16, 32 and 48 pixels in both chromes. new ships start as one dot on a hue tile.</p><table><thead><tr><th>ship</th><th>light</th><th>dark</th></tr></thead><tbody>${rows}</tbody></table></html>\n`,
  );
  console.log(out);
}

function main(args: string[]): number {
  const [command, ...rest] = args;
  const positional = command === "new" ? rest.shift() : undefined;
  const allowed =
    command === "new" ? ["--target", "--url", "--label", "--receipt"] : command === "sheet" ? ["--out"] : [];
  const options = new Map<string, string>();
  for (let i = 0; i < rest.length; i += 2) {
    if (!allowed.includes(rest[i]!) || !rest[i + 1] || rest[i + 1]!.startsWith("--") || options.has(rest[i]!)) {
      console.error(
        "usage: marks new <id> [--target soliton|cloudflare] [--url URL|none] [--label name] [--receipt FILE] | check | sheet [--out FILE]",
      );
      return 2;
    }
    options.set(rest[i]!, rest[i + 1]!);
  }
  if (!["new", "check", "sheet"].includes(command ?? "") || (command === "new" && !positional)) {
    console.error(
      "usage: marks new <id> [--target soliton|cloudflare] [--url URL|none] [--label name] [--receipt FILE] | check | sheet [--out FILE]",
    );
    return 2;
  }
  try {
    const manifest = loadFleet();
    if (command === "new") newShip(manifest, positional!, options);
    if (command === "check") {
      check(manifest);
      console.log(`marks check: ${manifest.fleet.length} marks pass at 16px in both chromes`);
    }
    if (command === "sheet") sheet(manifest, resolve(options.get("--out") ?? join(publicMarks, "sheet.html")));
    return 0;
  } catch (error) {
    console.error(`marks: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
