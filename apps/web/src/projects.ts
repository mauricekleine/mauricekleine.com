// the project manifest: the one place a project's facts live.
// tools/sync-projects.ts writes public/api/projects.json and llms.txt's side
// quests from it; pages, links.ts and the drift check read it directly.
// hand-written prose (index.md, about.md, the page copy) stays hand-written,
// and tools/test-projects.mjs fails when its links disagree with this file.

export type SideQuest = {
  name: string;
  url: string;
  status: "active";
  description: string;
  team?: string[];
  // public profiles that belong to the project, not to maurice
  profiles?: { github?: string; youtube?: string; tiktok?: string; spotify?: string };
  // what the live site must say about maurice; checked daily by tools/drift-check.mjs
  credit: "visible" | "json-ld" | "none";
};

export type EndedProject = { name: string; status: string; years: string; epitaph: string };

export const philosophy =
  "life is a series of experiments. some of them end, and that's fine, as long as you keep learning.";

export const sideQuests = {
  mockly: {
    name: "mockly",
    url: "https://www.getmockly.com",
    status: "active",
    description:
      "fake chat screenshots for 17+ platforms. built it in a weekend, techcrunch wrote about it, 10k people use it. i can't believe this is legal",
    team: ["maurice kleine", "jasper de boer"],
    credit: "json-ld",
  },
  fluncle: {
    name: "fluncle",
    url: "https://www.fluncle.com",
    status: "active",
    description: "drum & bass bangers from another dimension. it has a radio, an api, and an ssh rave terminal",
    profiles: {
      github: "https://github.com/mauricekleine/fluncle",
      youtube: "https://www.youtube.com/@fluncle",
      tiktok: "https://www.tiktok.com/@fluncle",
      spotify: "https://open.spotify.com/playlist/1m5LADqpLjiBERdtqrIiL0",
    },
    credit: "visible",
  },
  hackadam: {
    name: "hackadam",
    url: "https://hackadam.nl",
    status: "active",
    description: "monthly meetup in amsterdam for indie makers building their own stuff",
    team: ["maurice kleine", "abner van den hout"],
    credit: "none",
  },
  nonobench: {
    name: "nonobench",
    url: "https://www.nonobench.com",
    status: "active",
    description:
      "benchmark for how well llms solve nonogram puzzles. the top score went from 63% in february to 93% in september",
    profiles: { github: "https://github.com/mauricekleine/nonobench" },
    credit: "visible",
  },
} satisfies Record<string, SideQuest>;

export const graveyard: EndedProject[] = [
  {
    name: "logistics system",
    status: "sold",
    years: "2013-2019",
    epitaph:
      "built at uni because my part-time job ran on spreadsheets and hope. sold it six years later. small exit, still proud",
  },
  {
    name: "subthread",
    status: "dissolved",
    years: "2023-2025",
    epitaph:
      "co-founded a studio, shipped dozens of ai products. chatbots, recruitment pipelines, consumer apps. learned how much ai can do for normal businesses",
  },
  {
    name: "onesixtyeight",
    status: "discontinued",
    years: "2025-2026",
    epitaph: "functional mushroom blend for focus. turns out atoms are harder than bits",
  },
  {
    name: "spinup",
    status: "spun down",
    years: "2025-2026",
    epitaph:
      "cloud agent runtime on firecracker microvms. joining waimakers was part of the deal, so it counts as an exit. probably",
  },
];
