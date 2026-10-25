// Checks public/fonts/ against packages/superthread/fonts.ts, the one face manifest: every face has its file, every
// file is a face or its family's licence, every face is a woff2, and every family has its licence beside it. Where
// fontconfig's fc-scan is installed, each face's foundry, weight and slant must be the manifest's. Family names are
// not compared, because Fontshare's name table makes fc-scan print "false" for Supreme; the foundry is the vendor id
// in the face's OS/2 table. Prints each failure and exits 1 on any.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { fonts } = await import("@mauricekleine/superthread/fonts");

const dir = join(dirname(fileURLToPath(import.meta.url)), "../public/fonts");

// the foundry of each family, as fc-scan prints the OS/2 vendor id: NaN, the Indian Type Foundry, Wei Huang
const foundries = { Unbounded: "NAN", Supreme: "ITFO", Erode: "ITFO", "Fragment Mono": "WEI" };
// each licence class, the file name it takes beside its family, and a line its text carries
const licences = {
  OFL: { suffix: "OFL.txt", marker: "SIL Open Font License, Version 1.1" },
  "ITF FFL": { suffix: "LICENSE.txt", marker: "ITF Free Font License" },
};
// fontconfig's weight and slant scales, mapped to CSS
const cssWeight = { 50: 300, 80: 400, 100: 500, 180: 600 };
const cssStyle = { 0: "normal", 100: "italic" };

const slug = (family) => family.toLowerCase().replaceAll(" ", "-");
const licenceFile = (face) => `${slug(face.family)}-${licences[face.licence].suffix}`;

const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);

if (!existsSync(dir)) {
  console.error(`check-fonts: ${dir} is missing`);
  process.exit(1);
}
const present = new Set(readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile()));

// 1. the manifest itself: one entry per file, and a foundry and licence class this check knows
const names = fonts.map((face) => face.file);
for (const file of new Set(names.filter((file, i) => names.indexOf(file) !== i)))
  fail(file, "listed twice in fonts.ts");
for (const face of fonts) {
  if (!face.file.endsWith(".woff2")) fail(face.file, "a face file must be a .woff2");
  if (!(face.family in foundries)) fail(face.file, `no foundry known for ${face.family}`);
  if (!(face.licence in licences)) fail(face.file, `unknown licence class ${face.licence}`);
}

// 2. every face has its file, and every file is a face or a listed family's licence
const expected = new Map(fonts.map((face) => [face.file, "face"]));
for (const face of fonts) if (face.licence in licences) expected.set(licenceFile(face), "licence");
for (const [file, kind] of expected) if (!present.has(file)) fail(file, `the ${kind} file is missing`);
for (const file of present)
  if (!expected.has(file)) fail(file, "not listed in fonts.ts, nor a listed family's licence");

// 3. each face is a woff2; each licence carries its text
for (const face of fonts.filter((face) => present.has(face.file))) {
  const head = readFileSync(join(dir, face.file)).subarray(0, 4).toString("latin1");
  if (head !== "wOF2") fail(face.file, `starts with ${JSON.stringify(head)}, not "wOF2"`);
}
for (const [file, kind] of expected) {
  if (kind !== "licence" || !present.has(file)) continue;
  const face = fonts.find((face) => licenceFile(face) === file);
  if (!readFileSync(join(dir, file), "utf8").includes(licences[face.licence].marker))
    fail(file, `does not carry "${licences[face.licence].marker}"`);
}

// 4. foundry, weight and slant, read by fontconfig where it is installed
const probe = spawnSync("fc-scan", ["--version"], { encoding: "utf8" });
const scanned = probe.error === undefined && probe.status === 0;
const scanFormat = "%{foundry}|%{weight}|%{slant}|%{variable}\\n";
if (scanned)
  for (const face of fonts.filter((face) => present.has(face.file))) {
    const run = spawnSync("fc-scan", ["--format", scanFormat, join(dir, face.file)], { encoding: "utf8" });
    const lines = run.stdout.split("\n").filter(Boolean);
    if (run.status !== 0 || lines.length !== 1) {
      fail(face.file, `fc-scan read ${lines.length} faces (exit ${run.status}), expected one`);
      continue;
    }
    const [foundry, weight, slant, variable] = lines[0].split("|").map((part) => part.trim());
    if (foundry !== foundries[face.family])
      fail(face.file, `foundry ${foundry}, expected ${foundries[face.family]} for ${face.family}`);
    if (cssWeight[weight] !== face.weight)
      fail(face.file, `fontconfig weight ${weight} (css ${cssWeight[weight] ?? "unmapped"}), expected ${face.weight}`);
    if (cssStyle[slant] !== face.style)
      fail(face.file, `fontconfig slant ${slant} (${cssStyle[slant] ?? "unmapped"}), expected ${face.style}`);
    // an fc-scan too old to know %{variable} prints nothing for it
    if (variable && variable.toLowerCase() !== "false") fail(face.file, "a variable font, expected a static instance");
  }

if (failures.length > 0) {
  for (const failure of failures) console.error(`check-fonts: ${failure}`);
  console.error(`check-fonts: ${failures.length} failures`);
  process.exit(1);
}
const families = new Set(fonts.map((face) => face.family)).size;
const scan = scanned ? "foundry, weight and slant match (fc-scan)" : "foundry, weight and slant unchecked (no fc-scan)";
console.log(`check-fonts: ${fonts.length} faces in ${families} families, each a woff2 beside its licence; ${scan}`);
