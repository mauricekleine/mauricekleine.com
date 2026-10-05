// writes public/api/projects.json and llms.txt's side quests from src/projects.ts.
// run before sync-essays.py and the vite build; `--check` fails instead of writing,
// so the test suite catches a manifest edit that wasn't synced.

import { readFileSync, writeFileSync } from "node:fs";
import { graveyard, philosophy, sideQuests } from "../src/projects.ts";

const PUBLIC = new URL("../public/", import.meta.url);
const check = process.argv.includes("--check");
const stale: string[] = [];

function sync(path: string, next: string) {
  const file = new URL(path, PUBLIC);
  if (readFileSync(file, "utf8") === next) return;
  if (check) stale.push(path);
  else writeFileSync(file, next);
}

const quests = Object.values(sideQuests);

sync(
  "api/projects.json",
  JSON.stringify(
    {
      philosophy,
      side_quests: quests.map(({ name, url, status, description, team }) => ({ name, url, status, description, team })),
      graveyard,
    },
    null,
    2,
  ) + "\n",
);

// llms.txt: only the block between "## side quests" and the next heading is ours;
// sync-essays.py owns the essays block above it
const llms = readFileSync(new URL("llms.txt", PUBLIC), "utf8");
const rows = quests.map(({ name, url, description, team }) => {
  const others = team?.filter((member) => member !== "maurice kleine");
  return `- [${name}](${url}): ${description}${others?.length ? ` (with ${others.join(", ")})` : ""}`;
});
const block = /(?<=## side quests\n\n).*?(?=\n\n## )/s;
if (!block.test(llms)) throw new Error("llms.txt has no side quests block");
sync("llms.txt", llms.replace(block, rows.join("\n")));

if (stale.length) {
  console.error(`out of date with src/projects.ts: ${stale.join(", ")}. run node apps/web/tools/sync-projects.ts`);
  process.exit(1);
}
