// What the foundations pages read from the master world beside tokens.ts. tokens.ts keeps values and leaves the
// master's words out, so the recipes (the wedge step or ink each role is mixed from) and the ships' spot names come
// from the vendored master itself and cannot drift from it.
import { recipe, ships } from "../../../../packages/superthread/tokens/master.json";
import type { ShipId } from "@/components/superthread/lib/fleet";
import { tokens } from "@/components/superthread/lib/tokens";

export type Mode = "light" | "dark";
export const modes: readonly Mode[] = ["light", "dark"];

// role name to recipe, per mode, in the master's order
export const recipes: Record<Mode, Readonly<Record<string, string>>> = recipe;

export const spotName = (id: ShipId): string => ships[id]["spot name"];

// a role's hex in one mode, by name; a role drawn as plain css (a transparent edge) has none
const palette: Record<Mode, Readonly<Record<string, { readonly hex?: string; readonly css?: string }>>> = tokens;
export const hexOf = (mode: Mode, role: string): string => palette[mode][role]?.hex ?? "";
