import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { sideQuests } = await import("../src/projects.ts");
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

// hand-written copy keeps its own words, but a link to a side quest must use the manifest's url
test("markdown twins link each side quest at its manifest url", () => {
  for (const page of ["../public/index.md", "../public/about.md"]) {
    const markdown = read(page);
    for (const { name, url } of Object.values(sideQuests)) {
      const links = [...markdown.matchAll(new RegExp(`\\[${name}\\]\\(([^)]+)\\)`, "g"))].map((m) => m[1]);
      assert.ok(links.length > 0, `${page} never links ${name}`);
      for (const link of links) assert.equal(link, url, `${page} links ${name}`);
    }
  }
});

// the fleet rail ships as a copied registry component, so it can't import the manifest
test("both fleet rail copies link public side quests at their manifest urls", () => {
  for (const rail of ["../src/components/superthread/ui/fleet-rail.tsx", "../../../packages/superthread/registry/ui/fleet-rail.tsx"]) {
    const entries = [...read(rail).matchAll(/name: '([a-z]+)\.com', href: '([^']+)'/g)];
    const checked = entries.filter(([, name]) => name in sideQuests);
    assert.ok(checked.length > 0, `${rail} has no side quests`);
    for (const [, name, href] of checked) assert.equal(href, sideQuests[name].url, `${rail} links ${name}`);
  }
});
