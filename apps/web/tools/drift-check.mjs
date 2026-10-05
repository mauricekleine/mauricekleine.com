// daily drift check (.github/workflows/drift.yml): compares the live web to src/projects.ts.
// prints a markdown report and writes drift-report.json: { drift: [], unknown: [] }.
// drift is something live that disagrees with the manifest; unknown is a check that
// couldn't run (network, timeouts). unknowns never count as clean.

import { writeFileSync } from "node:fs";

const { sideQuests } = await import("../src/projects.ts");
const { shortLinks } = await import("../src/links.ts");

const PERSON_ID = "https://www.mauricekleine.com/#maurice";
const README = "https://raw.githubusercontent.com/mauricekleine/mauricekleine/main/README.md";
const UA = "Mozilla/5.0 (compatible; mauricekleine-drift/1.0; +https://www.mauricekleine.com)";
const quests = Object.values(sideQuests);
const ownedHosts = new Set(["www.mauricekleine.com", ...quests.map((quest) => new URL(quest.url).host)]);
const bare = (host) => host.replace(/^www\./, "");

const drift = [];
const unknown = [];

async function get(url) {
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
      return { status: res.status, finalUrl: new URL(res.url), body: await res.text() };
    } catch (e) {
      error = e;
      await new Promise((resolve) => setTimeout(resolve, 2_000 * (attempt + 1)));
    }
  }
  return { error: error?.cause?.code ?? error?.message ?? String(error) };
}

// side quests: reachable, on their canonical host, crediting maurice the agreed way
for (const quest of quests) {
  const res = await get(quest.url);
  // a domain that doesn't resolve is drift, not flakiness: that's how hackadam.nl lapsed
  if (res.error === "ENOTFOUND") { drift.push(`${quest.name}: ${quest.url} does not resolve`); continue; }
  if (res.error) { unknown.push(`${quest.name}: ${quest.url} failed (${res.error})`); continue; }
  if (res.status >= 500) { unknown.push(`${quest.name}: ${quest.url} returned ${res.status}`); continue; }
  if (res.status >= 400) { drift.push(`${quest.name}: ${quest.url} returned ${res.status}`); continue; }

  const host = new URL(quest.url).host;
  if (res.finalUrl.host !== host) drift.push(`${quest.name}: ${quest.url} ends up on ${res.finalUrl.host}`);
  const canonical = res.body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
  if (canonical && new URL(canonical, res.finalUrl).host !== host) {
    drift.push(`${quest.name}: canonical points at ${new URL(canonical, res.finalUrl).host}`);
  }

  if (quest.credit === "none") continue;
  if (!res.body.includes(`"@id":"${PERSON_ID}"`)) drift.push(`${quest.name}: json-ld no longer references ${PERSON_ID}`);
  if (quest.credit === "visible" && !/<a[^>]+href="https:\/\/www\.mauricekleine\.com\/?"/.test(res.body)) {
    drift.push(`${quest.name}: no visible link to www.mauricekleine.com`);
  }
}

// mk.wtf: every destination on a domain maurice owns still answers.
// social profiles are skipped: their bot walls would cry wolf daily
const destinations = [...new Set(shortLinks.values())].filter((url) => ownedHosts.has(new URL(url).host));
for (const url of destinations) {
  if (quests.some((quest) => quest.url === url.replace(/\/$/, ""))) continue; // checked above
  const res = await get(url);
  if (res.error === "ENOTFOUND") drift.push(`mk.wtf destination ${url} does not resolve`);
  else if (res.error || res.status >= 500) unknown.push(`mk.wtf destination ${url} failed (${res.error ?? res.status})`);
  else if (res.status >= 400) drift.push(`mk.wtf destination ${url} returned ${res.status}`);
}

// profile readme: links to a side quest's domain use its manifest url
const readme = await get(README);
if (readme.error || readme.status !== 200) {
  unknown.push(`profile readme failed (${readme.error ?? readme.status})`);
} else {
  for (const [, link] of readme.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    const quest = quests.find((q) => bare(new URL(q.url).host) === bare(new URL(link).host));
    if (quest && link.replace(/\/$/, "") !== quest.url) drift.push(`profile readme links ${quest.name} as ${link}, manifest says ${quest.url}`);
  }
  for (const quest of quests) {
    if (!readme.body.includes(`(${quest.url})`)) drift.push(`profile readme doesn't link ${quest.name} at ${quest.url}`);
  }
}

const section = (title, items) => (items.length ? `### ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}\n` : "");
const report = drift.length || unknown.length
  ? `${section("drift", drift)}\n${section("couldn't check", unknown)}`.trim()
  : "everything matches src/projects.ts.";
console.log(report);
writeFileSync("drift-report.json", JSON.stringify({ drift, unknown, report }, null, 2));
