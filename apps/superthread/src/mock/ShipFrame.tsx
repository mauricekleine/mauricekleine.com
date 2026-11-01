import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { fleet } from "@/components/superthread/lib/fleet";
import { AppShell, AppShellGround, AppShellNav, AppShellNavItem } from "@/components/superthread/blocks/app-shell";
import type { ShipNavItem } from "./data";

// Only the ships with mock pages open here; null keeps the other cells off their fleet urls, so they remain unavailable.
const hrefs = {
  ...Object.fromEntries(fleet.map((ship) => [ship.id, null])),
  home: "/",
  orbit: "/mock/board",
  quanta: "/mock/reading",
};

// The docs shell already owns main and the banner, so the embedded shell uses a div and a group.
export function ShipFrame({
  ship,
  nav,
  current,
  children,
}: {
  ship: string;
  nav: readonly ShipNavItem[];
  current: string;
  children: ReactNode;
}) {
  return (
    <AppShell
      current={ship}
      markBase="/marks"
      hrefs={hrefs}
      skipLink={false}
      className="min-h-[calc(100svh-32px)]"
      sidebar={
        <AppShellNav ship={ship} role="group">
          {nav.map((item) => (
            <AppShellNavItem
              key={item.label}
              isActive={item.label === current}
              number={item.number}
              render={item.to ? <Link to={item.to} /> : <span role="link" aria-disabled="true" />}
            >
              {item.label}
            </AppShellNavItem>
          ))}
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>{children}</AppShellGround>
    </AppShell>
  );
}
