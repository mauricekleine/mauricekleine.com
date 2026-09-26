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

function parseAttributes(tag) {
  const attributes = {};
  const prefix = /^<[^\s/>]+\s*/.exec(tag)?.[0] ?? tag;
  const content = tag.slice(prefix.length, tag.length - 1);
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = re.exec(content))) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes[key] = decodeEntities(value);
  }
  return attributes;
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    mdash: String.fromCodePoint(0x2014),
    middot: "·",
    nbsp: "\u00a0",
    ndash: "–",
    quot: '"',
    rdquo: "”",
    rsquo: "’",
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (entity, code) => {
    if (code[0] === "#") {
      const number = code[1]?.toLowerCase() === "x"
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function normalizedText(html) {
  let body = /<body\b[^>]*>([\s\S]*?)<\/body\s*>/i.exec(html)?.[1] ?? html;
  body = body
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<\/(?:address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|table|tbody|td|th|tr|ul)\s*>/gi, " ")
    .replace(/<br\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, " ");
  return decodeEntities(body).replace(/[\s\u00a0]+/g, " ").trim();
}

function tags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, "gi");
  return [...html.matchAll(re)].map((match) => match[0]);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function headData(html) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head\s*>/i.exec(html)?.[1] ?? "";
  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(head)?.[1] ?? "";
  const description = [];
  const social = [];
  for (const tag of tags(head, "meta")) {
    const attributes = parseAttributes(tag);
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
  for (const tag of tags(head, "link")) {
    const attributes = parseAttributes(tag);
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
    title: decodeEntities(title.replace(/<[^>]*>/g, "")).replace(/[\s\u00a0]+/g, " ").trim(),
    description: description.sort(),
    canonical: canonicals.sort(),
    social: social.sort(([a, b], [c, d]) => a.localeCompare(c) || b.localeCompare(d)),
    alternates: alternates.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  };
}

function jsonLdData(html) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head\s*>/i.exec(html)?.[1] ?? "";
  return stable([...head.matchAll(/<script\b([^>]*type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')[^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .map((match) => {
      try {
        return JSON.parse(match[2].trim());
      } catch (error) {
        throw new Error(`invalid JSON-LD: ${error.message}`);
      }
    }));
}

function pageData(html) {
  const links = [...new Set([...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => parseAttributes(match[0]).href)
    .filter((href) => href !== undefined)
    .map((href) => href.trim())
    .sort())];
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map((match) => parseAttributes(match[0]).src)
    .filter(Boolean)
    .sort();
  return { text: normalizedText(html), links, head: headData(html), jsonLd: jsonLdData(html), scripts };
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
      results.push({ route: page.route, differences: [`missing prerendered HTML for ${page.route}`] });
      continue;
    }
    const old = pageData(readFileSync(oldPath, "utf8"));
    const current = pageData(readFileSync(newPath, "utf8"));
    const differences = [];
    for (const field of ["text", "links", "jsonLd"]) {
      if (JSON.stringify(old[field]) !== JSON.stringify(current[field])) differences.push(field);
    }
    for (const field of Object.keys(old.head)) {
      if (JSON.stringify(old.head[field]) !== JSON.stringify(current.head[field])) {
        differences.push(`head.${field}`);
      }
    }
    results.push({ route: page.route, differences, scripts: current.scripts });
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
    `Static files byte-checked: ${staticCount}`,
    `Markdown files byte-checked: ${markdownCount}`,
    `Static byte differences: ${staticFailures.length}`,
    `Essay markdown twins included: ${essayTwinCount}`,
    "",
    "## Page results",
    "",
    ...pageResults.map((result) => `- ${result.route}: ${result.differences.length ? `DIFFERENT (${result.differences.join(", ")})` : "identical visible text, links, title/description/canonical/og/twitter/alternate tags, and parsed JSON-LD"}`),
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
