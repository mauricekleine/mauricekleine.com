import manifest from "../../../../packages/superthread/marks/fleet.json";
import type { ShipId } from "@/components/superthread/lib/fleet";
import type { Mode } from "./master";

// The marks this site serves under /marks, the folder the fleet rail's markBase names: <id>/<id>.svg for light
// chrome and <id>/<id>-dark.svg for dark. superthread's own mark is the rail's home cell and the favicon.
export const markBase = "/marks";

export type MarkId = ShipId | "superthread";

export const markFile = (id: MarkId, mode: Mode): string => `${id}${mode === "dark" ? "-dark" : ""}.svg`;
export const markUrl = (id: MarkId, mode: Mode): string => `${markBase}/${id}/${markFile(id, mode)}`;

// what each drawing shows, and where its one spot region sits
const originalDrawings: Partial<Record<MarkId, string>> = {
  superthread: "A printer's registration target; its centre takes the spot, in the house ink",
  orbit: "A lit planet with a small moon above it; the planet's night side takes the spot",
  quanta: "An open book; the right-hand page, the one being read, takes the spot",
  trisys: "A slide deck; the slide waiting behind the first takes the spot",
  constellation: "Four stars; the figure drawn between them takes the spot",
  artifacts: "A sheet lifted out of a folder; the folder takes the spot",
  soliton: "One solitary wave; the water under its crest takes the spot",
  telemetry: "Five readings on a chart; the body of each bar takes the spot",
  hyperspeed: "A chevron at speed; the after-image it leaves behind takes the spot",
};

// New ships live in the marks manifest until their glyph is drawn; the master stays immutable.
export const markShip = (id: MarkId) => {
  const ship = manifest.fleet.find((entry) => entry.id === id);
  if (!ship) throw new Error(`no mark for ${id}`);
  return ship;
};
export const shipSpot = (id: MarkId, mode: Mode): string => markShip(id).spot[mode];
export const drawn = Object.fromEntries(
  manifest.fleet.map((ship) => [
    ship.id,
    originalDrawings[ship.id as MarkId] ??
      (ship.kind === "star" ? "A single dot in its screened hue tile, until its glyph is drawn" : ship.desc),
  ]),
) as Record<MarkId, string>;

// a chart series' line screen per ship, written out so Tailwind finds each class in this source
export const lineScreen: Record<ShipId, string> = {
  orbit: "texture-line-orbit",
  quanta: "texture-line-quanta",
  trisys: "texture-line-trisys",
  constellation: "texture-line-constellation",
  artifacts: "texture-line-artifacts",
  telemetry: "texture-line-telemetry",
  soliton: "texture-line-soliton",
  hyperspeed: "texture-line-hyperspeed",
};

// the browser chrome a 16 px mark sits on as a favicon: the tab strip and the tab itself, light then dark. These are
// the browser's colours, not the system's, so they stay literal.
export const chromes: readonly { name: string; color: string; mode: Mode }[] = [
  { name: "Light strip", color: "#dee1e6", mode: "light" },
  { name: "Light tab", color: "#ffffff", mode: "light" },
  { name: "Dark strip", color: "#202124", mode: "dark" },
  { name: "Dark tab", color: "#35363a", mode: "dark" },
];

// the browser tab a mode's file is drawn for, to show a 16 px file where it belongs
export const tabColor = (mode: Mode): string =>
  chromes.find((chrome) => chrome.mode === mode && chrome.name.endsWith(" tab"))?.color ?? "";
