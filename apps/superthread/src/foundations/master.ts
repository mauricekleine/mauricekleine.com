// What the foundations pages read from the master world beside tokens.ts. tokens.ts keeps values and leaves the
// master's words out, so the recipes (the wedge step or ink each role is mixed from), the ships' spot names and the
// proofs the master records for each spot come from the vendored master itself and cannot drift from it.
import { contrast, de, tint } from "../../../../packages/superthread/scripts/color";
import { markShip, shipSpot } from "./marks";
import { house, recipe, ships } from "../../../../packages/superthread/tokens/master.json";
import type { ShipId } from "@/components/superthread/lib/fleet";
import { tokens } from "@/components/superthread/lib/tokens";

export type Mode = "light" | "dark";
export const modes: readonly Mode[] = ["light", "dark"];

// role name to recipe, per mode, in the master's order
export const recipes: Record<Mode, Readonly<Record<string, string>>> = recipe;

const masterShip = (id: ShipId) => (ships as Partial<Record<ShipId, (typeof ships)[keyof typeof ships]>>)[id];
export const spotName = (id: ShipId): string =>
  masterShip(id)?.["spot name"] ?? (markShip(id).kind === "star" ? "new star" : markShip(id).desc);

// the least distance a ship's spot keeps from the house ink, oklab delta e x 100 (the master's floors unit)
export const spotFloor: number = house.floors["lead house inks from every ship spot"];

// the house ink nearest a ship's spot in one mode and how far it sits, from the master's "<ink>, delta e <n>"
export function nearestHouse(id: ShipId, mode: Mode): { ink: string; distance: number } {
  const source = masterShip(id);
  if (!source) return { ink: "plum", distance: de(shipSpot(id, mode), tokens[mode].primary.hex) };
  const recorded = source["nearest lead house ink"][mode];
  const match = /^(.+), delta e (\d+(?:\.\d+)?)$/.exec(recorded);
  if (!match) throw new Error(`unreadable nearest house ink for ${id} in ${mode}: ${recorded}`);
  return { ink: match[1], distance: Number(match[2]) };
}

// the contrast of a ship mark's dithered region (the spot at 50 percent over the silhouette) on its tile
export const regionOnTile = (id: ShipId, mode: Mode): number =>
  masterShip(id)?.contrast[mode]["dithered region on tile"] ??
  contrast(
    tint(shipSpot(id, mode), mode === "light" ? "#ffffff" : "#16181d", 50),
    mode === "light" ? "#16181d" : "#ffffff",
  );

// a role's hex in one mode, by name; a role drawn as plain css (a transparent edge) has none
const palette: Record<Mode, Readonly<Record<string, { readonly hex?: string; readonly css?: string }>>> = tokens;
export const hexOf = (mode: Mode, role: string): string => palette[mode][role]?.hex ?? "";
