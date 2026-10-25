import type { CSSProperties } from "react";
import { fleet, type ShipId } from "@/components/superthread/lib/fleet";

import { spotName } from "@/foundations/master";

export const spotNames = Object.fromEntries(fleet.map((ship) => [ship.id, spotName(ship.id)])) as Readonly<
  Record<ShipId, string>
>;

// the mark files a ship prints, from the I2 kit paths under /marks
export function markUrls(id: ShipId): { light: string; dark: string } {
  const ship = fleet.find((candidate) => candidate.id === id);
  if (!ship) throw new Error(`no ship ${id}`);
  return { light: `/marks/${id}/${ship.mark.light}`, dark: `/marks/${id}/${ship.mark.dark}` };
}

// The ships in fleet order: each mark at 48 px (three screen pixels to a mark cell), its name and its spot ink.
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
