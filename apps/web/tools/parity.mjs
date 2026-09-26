#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const siteRoot = path.join(repoRoot, "apps/site");
const webRoot = path.join(repoRoot, "apps/web");
const reportPath = path.join(webRoot, "PARITY-REPORT.md");

function fail(message) {
  console.error(`Parity check failed: ${message}`);
  process.exit(1);
}

function runBuild() {
  console.log("Building and prerendering apps/web with `bun run build`...");
  const result = spawnSync("bun", ["run", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.error) fail(`could not run bun: ${result.error.message}`);
  if (result.status !== 0) fail(`bun run build exited with status ${result.status}`);
}

function walkFiles(root, relative = "") {
  const directory = path.join(root, relative);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) return walkFiles(root, child);
    return entry.isFile() ? [child] : [];
  });
}

function findOutputDir() {
  const configured = process.env.WEB_PARITY_OUTPUT_DIR;
  const candidates = configured
    ? [path.resolve(repoRoot, configured)]
    : [
        "apps/web/dist/client",
        "apps/web/dist",
        "apps/web/.output/public",
        "apps/web/build/client",
        "apps/web/build",
        "apps/web/.vercel/output/static",
      ].map((candidate) => path.join(repoRoot, candidate));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "style.css")) && existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  const details = candidates.map((candidate) => path.relative(repoRoot, candidate)).join(", ");
  fail(`could not find the prerendered public directory containing style.css and index.html. Checked: ${details}. Set WEB_PARITY_OUTPUT_DIR to override.`);
}

function htmlFilesForPages() {
  const pages = [
    { route: "/", source: "index.html" },
    { route: "/about", source: "about.html" },
    { route: "/essays", source: "essays.html" },
    { route: "/404", source: "404.html" },
  ];
  for (const filename of readdirSync(path.join(siteRoot, "essays"))) {
    if (!filename.endsWith(".html")) continue;
    pages.push({ route: `/essays/${filename.slice(0, -5)}`, source: `essays/${filename}` });
  }
  return pages;
}

function outputHtmlPath(outputDir, route) {
  const clean = route.replace(/^\//, "");
  const candidates = route === "/"
    ? ["index.html"]
    : route === "/404"
      ? ["404.html", "404/index.html", "404/index.htm"]
      : [`${clean}.html`, `${clean}/index.html`, `${clean}/index.htm`];
  const found = candidates.find((candidate) => existsSync(path.join(outputDir, candidate)));
  return found ? path.join(outputDir, found) : null;
}

const textBoundaryTags = new Set([
  "address", "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt",
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4",
  "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "section",
  "table", "tbody", "td", "th", "tr", "ul",
]);
const ignoredTextTags = new Set(["script", "style", "template", "svg"]);

function childrenOf(node) {
  return node.childNodes ?? [];
}

function attributesOf(node) {
  return Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
}

function findElement(node, tagName) {
  if (node.tagName === tagName) return node;
  for (const child of childrenOf(node)) {
    const found = findElement(child, tagName);
    if (found) return found;
  }
  return undefined;
}

function elements(node, tagName, result = []) {
  if (node.tagName === tagName) result.push(node);
  for (const child of childrenOf(node)) elements(child, tagName, result);
  return result;
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value ?? "";
  return childrenOf(node).map(textContent).join("");
}

function normalizedText(document) {
  const body = findElement(document, "body") ?? document;
  const parts = [];
  function visit(node) {
    if (node.nodeName === "#text") {
      parts.push(node.value ?? "");
      return;
    }
    if (ignoredTextTags.has(node.tagName)) return;
    if (textBoundaryTags.has(node.tagName)) parts.push(" ");
    for (const child of childrenOf(node)) visit(child);
    if (textBoundaryTags.has(node.tagName)) parts.push(" ");
  }
  visit(body);
  return parts.join("").replace(/[\s\u00a0]+/g, " ").trim();
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function headData(document) {
  const head = findElement(document, "head");
  if (!head) return { title: "", description: [], canonical: [], social: [], alternates: [] };
  const titleElement = findElement(head, "title");
  const title = titleElement ? textContent(titleElement) : "";
  const description = [];
  const social = [];
  for (const meta of elements(head, "meta")) {
    const attributes = attributesOf(meta);
    if (attributes.name?.toLowerCase() === "description") {
      description.push(attributes.content ?? "");
    }
    const key = attributes.property?.toLowerCase() ?? attributes.name?.toLowerCase();
    if (key?.startsWith("og:") || key?.startsWith("twitter:")) {
      social.push([key, attributes.content ?? ""]);
    }
  }
  const canonicals = [];
  const alternates = [];
  for (const link of elements(head, "link")) {
    const attributes = attributesOf(link);
    const rel = (attributes.rel ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) canonicals.push(attributes.href ?? "");
    if (rel.includes("alternate")) {
      alternates.push({
        href: attributes.href ?? "",
        rel: rel.join(" "),
        title: attributes.title ?? "",
        type: attributes.type ?? "",
      });
    }
  }
  return {
    title: title.replace(/[\s\u00a0]+/g, " ").trim(),
    description: description.sort(),
    canonical: canonicals.sort(),
    social: social.sort(([a, b], [c, d]) => a.localeCompare(c) || b.localeCompare(d)),
    alternates: alternates.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  };
}

function jsonLdData(document) {
  const head = findElement(document, "head");
  if (!head) return [];
  return stable(elements(head, "script")
    .filter((script) => attributesOf(script).type?.toLowerCase() === "application/ld+json")
    .map((script) => {
      try {
        return JSON.parse(textContent(script).trim());
      } catch (error) {
        throw new Error(`invalid JSON-LD: ${error.message}`);
      }
    }));
}

function mainStructure(document) {
  const main = findElement(document, "main");
  if (!main) return [];
  const sequence = [];
  function visit(node, depth) {
    if (!node.tagName) return;
    const classes = (attributesOf(node).class ?? "").trim().split(/\s+/).filter(Boolean);
    sequence.push({ tag: node.tagName, classes, depth });
    for (const child of childrenOf(node)) visit(child, depth + 1);
  }
  visit(main, 0);
  return sequence;
}

function mainAttributes(document) {
  const main = findElement(document, "main");
  if (!main) return [];
  const sequence = [];
  function visit(node) {
    if (!node.tagName) return;
    sequence.push(Object.entries(attributesOf(node)).sort(([left], [right]) => left.localeCompare(right)));
    for (const child of childrenOf(node)) visit(child);
  }
  visit(main);
  return sequence;
}

function pageData(html) {
  const document = parse(html);
  const links = [...new Set(elements(document, "a")
    .map((anchor) => attributesOf(anchor).href)
    .filter((href) => href !== undefined)
    .map((href) => href.trim())
    .sort())];
  const scripts = elements(document, "script")
    .map((script) => attributesOf(script).src)
    .filter(Boolean)
    .sort();
  return {
    text: normalizedText(document),
    links,
    head: headData(document),
    jsonLd: jsonLdData(document),
    scripts,
    mainStructure: mainStructure(document),
    mainAttributes: mainAttributes(document),
  };
}

function structureDifference(oldStructure, newStructure) {
  const length = Math.max(oldStructure.length, newStructure.length);
  let index = 0;
  while (index < length && JSON.stringify(oldStructure[index]) === JSON.stringify(newStructure[index])) {
    index += 1;
  }
  if (index === length) return undefined;
  const describe = (node) => node
    ? `depth ${node.depth} <${node.tag}${node.classes.length ? ` class="${node.classes.join(" ")}"` : ""}>`
    : "<end>";
  return {
    index,
    old: describe(oldStructure[index]),
    current: describe(newStructure[index]),
    oldLength: oldStructure.length,
    currentLength: newStructure.length,
  };
}

function ignoredByAssetsIgnore(relativePath, entries) {
  return entries.some((entry) => {
    if (!entry) return false;
    if (entry.endsWith("/")) return relativePath === entry.slice(0, -1) || relativePath.startsWith(entry);
    return relativePath === entry || relativePath.startsWith(`${entry}/`);
  });
}

function staticFiles() {
  const ignoreFile = path.join(siteRoot, ".assetsignore");
  const ignores = readFileSync(ignoreFile, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  ignores.push(".assetsignore", "_headers");
  const pageSources = new Set(htmlFilesForPages().map((page) => page.source));
  return walkFiles(siteRoot)
    .filter((relative) => !pageSources.has(relative))
    .filter((relative) => !ignoredByAssetsIgnore(relative, ignores))
    .sort();
}

function comparePages(outputDir, pages) {
  const results = [];
  for (const page of pages) {
    const oldPath = path.join(siteRoot, page.source);
    const newPath = outputHtmlPath(outputDir, page.route);
    if (!newPath) {
      const old = pageData(readFileSync(oldPath, "utf8"));
      const mainDifference = structureDifference(old.mainStructure, []);
      results.push({
        route: page.route,
        differences: [`missing prerendered HTML for ${page.route}`, "main DOM structure"],
        mainNodeCount: 0,
        mainDifference,
      });
      continue;
    }
    const old = pageData(readFileSync(oldPath, "utf8"));
    const current = pageData(readFileSync(newPath, "utf8"));
    const differences = [];
    for (const field of ["text", "links", "jsonLd"]) {
      if (JSON.stringify(old[field]) !== JSON.stringify(current[field])) differences.push(field);
    }
    const mainDifference = structureDifference(old.mainStructure, current.mainStructure);
    if (mainDifference) differences.push("main DOM structure");
    const attributeDifference = old.mainAttributes.findIndex((attributes, index) =>
      JSON.stringify(attributes) !== JSON.stringify(current.mainAttributes[index]));
    if (attributeDifference >= 0 || old.mainAttributes.length !== current.mainAttributes.length) {
      differences.push("main DOM attributes");
    }
    for (const field of Object.keys(old.head)) {
      if (JSON.stringify(old.head[field]) !== JSON.stringify(current.head[field])) {
        differences.push(`head.${field}`);
      }
    }
    results.push({
      route: page.route,
      differences,
      mainNodeCount: current.mainStructure.length,
      mainDifference,
      attributeDifference,
      scripts: current.scripts,
    });
  }
  return results;
}

function compareStatic(outputDir, files) {
  const results = [];
  for (const relative of files) {
    const original = path.join(siteRoot, relative);
    const generated = path.join(outputDir, relative);
    if (!existsSync(generated)) {
      results.push({ path: relative, status: "missing" });
      continue;
    }
    const same = readFileSync(original).equals(readFileSync(generated));
    results.push({ path: relative, status: same ? "identical" : "different" });
  }
  return results;
}

function createReport(outputDir, pages, pageResults, staticResults) {
  const pageFailures = pageResults.filter((result) => result.differences.length > 0);
  const structureFailures = pageResults.filter((result) => result.mainDifference);
  const attributeFailures = pageResults.filter((result) => result.differences.includes("main DOM attributes"));
  const staticFailures = staticResults.filter((result) => result.status !== "identical");
  const generatedScripts = new Set();
  for (const result of pageResults) {
    for (const source of result.scripts ?? []) {
      if (!source.startsWith("http://") && !source.startsWith("https://")) generatedScripts.add(source);
    }
  }
  const oldScripts = new Set();
  for (const page of pages) {
    const old = pageData(readFileSync(path.join(siteRoot, page.source), "utf8"));
    for (const source of old.scripts) oldScripts.add(source);
  }
  const frameworkScripts = [...generatedScripts].filter((source) => !oldScripts.has(source)).sort();
  const staticCount = staticResults.filter((result) => !result.path.endsWith(".md")).length;
  const markdownCount = staticResults.length - staticCount;
  const essayTwinCount = pages.filter((page) => page.route.startsWith("/essays/")).length;
  const lines = [
    "# Static and HTML parity report",
    "",
    `Build output: \`${path.relative(repoRoot, outputDir)}\``,
    "Workers Builds command: `bun install && bun run build && bun run deploy` from the repository root.",
    "",
    `Pages checked: ${pages.length}`,
    `HTML parity failures: ${pageFailures.length}`,
    `Main DOM structure differences: ${structureFailures.length}`,
    `Main DOM attribute differences: ${attributeFailures.length}`,
    `Static files byte-checked: ${staticCount}`,
    `Markdown files byte-checked: ${markdownCount}`,
    `Static byte differences: ${staticFailures.length}`,
    `Essay markdown twins included: ${essayTwinCount}`,
    "",
    "## Page results",
    "",
    ...pageResults.map((result) => {
      const summary = result.differences.length
        ? `DIFFERENT (${result.differences.join(", ")})`
        : `identical visible text, links, title/description/canonical/og/twitter/alternate tags, parsed JSON-LD, and <main> tag/class/attribute sequence (${result.mainNodeCount} elements)`;
      const structure = result.mainDifference
        ? `; <main> first difference at element ${result.mainDifference.index}: old ${result.mainDifference.old}, new ${result.mainDifference.current} (lengths ${result.mainDifference.oldLength}/${result.mainDifference.currentLength})`
        : "";
      return `- ${result.route}: ${summary}${structure}`;
    }),
    "",
    "## Main DOM structure",
    "",
    ...(structureFailures.length
      ? structureFailures.map((result) => `- ${result.route}: first differing element ${result.mainDifference.index}, old ${result.mainDifference.old}, new ${result.mainDifference.current}; sequence lengths ${result.mainDifference.oldLength} old and ${result.mainDifference.currentLength} new.`)
      : [`All ${pageResults.length} pages have identical <main> tag and class sequences.`]),
    ...(attributeFailures.length
      ? attributeFailures.map((result) => `- ${result.route}: first differing attribute set at element ${result.attributeDifference}.`)
      : [`All ${pageResults.length} pages have identical <main> attribute sequences.`]),
    "",
    "## Static file results",
    "",
    ...(staticFailures.length
      ? staticFailures.map((result) => `- ${result.path}: ${result.status}`)
      : [`All ${staticResults.length} public static files, including ${markdownCount} Markdown files, match byte for byte.`]),
    "",
    "## Framework output",
    "",
    frameworkScripts.length
      ? `TanStack Start adds hydration/runtime scripts to prerendered pages: ${frameworkScripts.map((source) => `\`${source}\``).join(", ")}. They are generated framework output and are excluded from the requested page comparisons.`
      : "TanStack Start hydration/runtime script tags are generated framework output and are excluded from the requested page comparisons. No additional local script URLs were found.",
    "",
    pageFailures.length || staticFailures.length
      ? "Result: differences found."
      : "Result: zero differences in the compared page and static content.",
    "",
  ];
  return lines.join("\n");
}

runBuild();
const outputDir = findOutputDir();
const pages = htmlFilesForPages();
const staticList = staticFiles();
const pageResults = comparePages(outputDir, pages);
const staticResults = compareStatic(outputDir, staticList);
const report = createReport(outputDir, pages, pageResults, staticResults);
mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report);
console.log(report);

if (pageResults.some((result) => result.differences.length > 0) || staticResults.some((result) => result.status !== "identical")) {
  process.exitCode = 1;
}
