// The project manifest: the one place a project's facts live.
// tools/sync-projects.ts writes public/api/projects.json and llms.txt's side
// quests from it; pages, links.ts and the drift check read it directly.
// Hand-written prose (index.md, about.md, the page copy) stays hand-written,
// and tools/test-projects.mjs fails when its links disagree with this file.

export type SideQuest = {
  name: string;
  url: string;
  status: "active";
  description: string;
  team?: string[];
  // Public profiles that belong to the project, not to Maurice.
  profiles?: { github?: string; youtube?: string; tiktok?: string; spotify?: string };
  // What the live site must say about Maurice; checked daily by tools/drift-check.mjs.
  credit: "visible" | "json-ld" | "none";
};

export type EndedProject = { name: string; status: string; years: string; epitaph: string };

export const philosophy =
  "Life is a series of experiments. Some of them end, and that's fine, as long as you keep learning.";

export const sideQuests = {
  mockly: {
    name: "Mockly",
    url: "https://www.getmockly.com",
    status: "active",
    description:
      "Fake chat screenshots for 17+ platforms. Built it in a weekend, TechCrunch wrote about it, 10k people use it. I can't believe this is legal.",
    team: ["Maurice Kleine", "Jasper de Boer"],
    credit: "json-ld",
  },
  fluncle: {
    name: "Fluncle",
    url: "https://www.fluncle.com",
    status: "active",
    description: "Drum & bass bangers from another dimension. It has a radio, an API, and an SSH rave terminal.",
    profiles: {
      github: "https://github.com/mauricekleine/fluncle",
      youtube: "https://www.youtube.com/@fluncle",
      tiktok: "https://www.tiktok.com/@fluncle",
      spotify: "https://open.spotify.com/playlist/1m5LADqpLjiBERdtqrIiL0",
    },
    credit: "visible",
  },
  hackadam: {
    name: "Hackadam",
    url: "https://hackadam.nl",
    status: "active",
    description: "Monthly meetup in Amsterdam for indie makers building their own stuff.",
    team: ["Maurice Kleine", "Abner van den Hout"],
    credit: "none",
  },
  nonobench: {
    name: "Nonobench",
    url: "https://www.nonobench.com",
    status: "active",
    description:
      "Benchmark for how well LLMs solve nonogram puzzles. The top score went from 63% in February to 93% in September.",
    profiles: { github: "https://github.com/mauricekleine/nonobench" },
    credit: "visible",
  },
} satisfies Record<string, SideQuest>;

export const graveyard: EndedProject[] = [
  {
    name: "Logistics system",
    status: "Sold",
    years: "2013-2019",
    epitaph:
      "Built at uni because my part-time job ran on spreadsheets and hope. Sold it six years later. Small exit, still proud.",
  },
  {
    name: "Subthread",
    status: "Dissolved",
    years: "2023-2025",
    epitaph:
      "Co-founded a studio, shipped dozens of AI products. Chatbots, recruitment pipelines, consumer apps. Learned how much AI can do for normal businesses.",
  },
  {
    name: "Onesixtyeight",
    status: "Discontinued",
    years: "2025-2026",
    epitaph: "Functional mushroom blend for focus. Turns out atoms are harder than bits.",
  },
  {
    name: "Spinup",
    status: "Spun down",
    years: "2025-2026",
    epitaph:
      "Cloud agent runtime on Firecracker microVMs. Joining Waimakers was part of the deal, so it counts as an exit. Probably.",
  },
];
