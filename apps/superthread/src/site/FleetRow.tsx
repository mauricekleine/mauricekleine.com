import type { CSSProperties } from "react";
import { fleet, type ShipId } from "@/components/superthread/lib/fleet";

// each ship's spot ink by name, as the master's tokens.json names it under ships.<id>["spot name"];
// install.test.tsx holds the two equal
export const spotNames: Readonly<Record<ShipId, string>> = {
  orbit: "comet blue",
  quanta: "quark green",
  trisys: "flare orange",
  constellation: "nova violet",
  artifacts: "manila gold",
  soliton: "canal indigo",
};

// the mark files a ship prints, from the I2 kit paths under /marks
export function markUrls(id: ShipId): { light: string; dark: string } {
  const ship = fleet.find((candidate) => candidate.id === id);
  if (!ship) throw new Error(`no ship ${id}`);
  return { light: `/marks/${id}/${ship.mark.light}`, dark: `/marks/${id}/${ship.mark.dark}` };
}

// The six ships in fleet order: each mark at 48 px (three screen pixels to a mark cell), its name and its spot ink.
// The mark is a CSS background keyed on the mode, so only the active mode's file loads.
export function FleetRow() {
  return (
    <ul className="st-fleet">
      {fleet.map((ship) => {
        const urls = markUrls(ship.id);
        const style = {
          "--mark-light": `url("${urls.light}")`,
          "--mark-dark": `url("${urls.dark}")`,
        } as CSSProperties;
        return (
          <li key={ship.id}>
            <span className="st-fleet-mark" style={style} aria-hidden="true" />
            <b>{ship.name}</b>
            <span className="st-fleet-spot">{spotNames[ship.id]}</span>
          </li>
        );
      })}
    </ul>
  );
}
