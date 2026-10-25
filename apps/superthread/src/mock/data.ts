// Synthetic data for the mock pages: made-up tasks, runs, agents and a quanta chapter. Nothing here is real.

import type { StatusState } from "@/components/superthread/ui/glyphs";

export type MockPath = "/mock/board" | "/mock/reading" | "/mock/orbit";

// A ship's own nav: an item with a path is a page in the mock, the rest print as items the mock does not have.
export type ShipNavItem = { readonly label: string; readonly to?: MockPath; readonly number?: string };

export const orbitNav: readonly ShipNavItem[] = [
  { label: "board", to: "/mock/board" },
  { label: "direction" },
  { label: "agents", to: "/mock/orbit" },
  { label: "settings" },
];

export const quantaNav: readonly ShipNavItem[] = [
  { number: "05", label: "waves" },
  { number: "06", label: "interference" },
  { number: "07", label: "one photon", to: "/mock/reading" },
  { number: "08", label: "tunnelling" },
];

// the board

export type Task = {
  readonly id: string;
  readonly title: string;
  readonly state: StatusState;
  readonly agent: string;
  readonly age: string;
  readonly progress?: { readonly value: number; readonly step: string };
};

export const columns: readonly StatusState[] = ["queued", "running", "waiting", "done", "failed"];

export const tasks: readonly Task[] = [
  { id: "or-418", title: "write the release notes for next.2", state: "queued", agent: "unassigned", age: "12m" },
  { id: "or-405", title: "add the dark marks to the fleet rail", state: "queued", agent: "unassigned", age: "3h" },
  {
    id: "or-412",
    title: "tighten the select listbox keyboard loop",
    state: "running",
    agent: "codex 2",
    age: "4m",
    progress: { value: 60, step: "step 3 of 5" },
  },
  {
    id: "or-414",
    title: "split the board query by ship",
    state: "running",
    agent: "claude 2",
    age: "9m",
    progress: { value: 25, step: "step 1 of 4" },
  },
  {
    id: "or-411",
    title: "regenerate the registry css after the token change",
    state: "done",
    agent: "claude 1",
    age: "18m",
  },
  { id: "or-401", title: "trim unused motion tokens", state: "done", agent: "opencode 1", age: "5h" },
  { id: "or-406", title: "quanta chapter 7 footnotes render twice", state: "failed", agent: "codex 1", age: "2h" },
];

// The board's two filters: the status tabs over its rows, and the agent picker, which lists every agent with a task
// on the board (unassigned last).
export const boardStatuses = ["all", "running", "waiting", "done"] as const;
export type BoardStatus = (typeof boardStatuses)[number];

export const anyone = "anyone";
export const boardAgents: readonly string[] = [
  anyone,
  ...[...new Set(tasks.map((task) => task.agent))].sort((a, b) =>
    a === "unassigned" ? 1 : b === "unassigned" ? -1 : a.localeCompare(b),
  ),
];

// what an empty column says: what it holds and how a task gets there
export const emptyColumn: Readonly<Record<StatusState, { readonly title: string; readonly body: string }>> = {
  queued: { title: "nothing queued", body: "new tasks wait here until an agent picks one up." },
  running: { title: "nothing running", body: "an agent's task shows here while it works." },
  waiting: { title: "nothing waiting", body: "a task that needs an answer from you lands here." },
  done: { title: "nothing done yet", body: "finished tasks stay here for a week." },
  failed: { title: "nothing failed", body: "a run that breaks lands here with its log." },
};

// the orbit app frame

export const agentsSummary = "6 agents, 2 running";

export type Run = {
  readonly id: string;
  readonly task: string;
  readonly title: string;
  readonly ship: string;
  readonly agent: string;
  readonly state: StatusState;
  readonly started: string;
  readonly took: string;
};

export const runs: readonly Run[] = [
  {
    id: "r-2291",
    task: "or-412",
    title: "tighten the select listbox keyboard loop",
    ship: "orbit",
    agent: "codex 2",
    state: "running",
    started: "10:42",
    took: "4m",
  },
  {
    id: "r-2290",
    task: "qu-77",
    title: "check the figure plates at 2x",
    ship: "quanta",
    agent: "claude 1",
    state: "done",
    started: "10:31",
    took: "11m",
  },
  {
    id: "r-2289",
    task: "or-414",
    title: "split the board query by ship",
    ship: "orbit",
    agent: "claude 2",
    state: "running",
    started: "10:20",
    took: "9m",
  },
  {
    id: "r-2288",
    task: "or-406",
    title: "quanta chapter 7 footnotes render twice",
    ship: "orbit",
    agent: "codex 1",
    state: "failed",
    started: "09:58",
    took: "6m",
  },
  {
    id: "r-2287",
    task: "co-31",
    title: "answer the open question on star sizes",
    ship: "constellation",
    agent: "claude 3",
    state: "waiting",
    started: "09:40",
    took: "22m",
  },
  {
    id: "r-2285",
    task: "ar-12",
    title: "move the share links to the new host",
    ship: "artifacts",
    agent: "opencode 1",
    state: "done",
    started: "09:12",
    took: "3m",
  },
];

// what "show earlier runs" adds to the runs tab
export const earlierRuns: readonly Run[] = [
  {
    id: "r-2284",
    task: "or-411",
    title: "regenerate the registry css after the token change",
    ship: "orbit",
    agent: "claude 1",
    state: "done",
    started: "08:55",
    took: "18m",
  },
  {
    id: "r-2282",
    task: "qu-75",
    title: "proofread chapter 6",
    ship: "quanta",
    agent: "claude 3",
    state: "done",
    started: "08:31",
    took: "14m",
  },
  {
    id: "r-2281",
    task: "or-401",
    title: "trim unused motion tokens",
    ship: "orbit",
    agent: "opencode 1",
    state: "done",
    started: "08:02",
    took: "7m",
  },
  {
    id: "r-2279",
    task: "co-29",
    title: "redraw the map legend",
    ship: "constellation",
    agent: "codex 2",
    state: "failed",
    started: "07:46",
    took: "2m",
  },
];

export const ships = ["orbit", "quanta", "constellation", "artifacts", "trisys", "soliton"] as const;

// agent runs per week by ship, bottom series first; each week's total sits above its bar
export const weeks = ["w38", "w39", "w40", "w41", "w42", "w43"] as const;

export type ChartShip = "orbit" | "constellation" | "quanta" | "artifacts";

export const series: readonly { readonly ship: ChartShip; readonly runs: readonly number[] }[] = [
  { ship: "orbit", runs: [42, 50, 47, 62, 61, 70] },
  { ship: "constellation", runs: [17, 22, 19, 26, 28, 31] },
  { ship: "quanta", runs: [10, 13, 14, 13, 13, 15] },
  { ship: "artifacts", runs: [6, 8, 8, 10, 11, 13] },
];

// the reading page

export const chapter = {
  ship: "quanta",
  number: "chapter 7",
  title: "light, one piece at a time",
  folio: "7.2",
  page: { now: 3, of: 7, read: 42 },
} as const;

export const contents = [
  { id: "one-photon", title: "one photon at a time" },
  { id: "two-paths", title: "two paths, one pattern" },
  { id: "fig-7-2", title: "fig. 7.2 · the screen" },
  { id: "notes", title: "notes" },
] as const;
