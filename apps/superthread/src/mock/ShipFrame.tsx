import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell, AppShellNav, AppShellNavItem } from "@/components/superthread/blocks/app-shell";
import type { ShipNavItem } from "./data";

// Only the ships with mock pages open here; the other rail cells remain unavailable.
const hrefs = { home: "/", orbit: "/mock/board", quanta: "/mock/reading" };

// The docs shell already owns main. Keep a div for the ground until AppShellGround can render another element.
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
      className="min-h-[calc(100svh-32px)]"
      sidebar={
        <AppShellNav ship={ship}>
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
      <div className="mock-ground">{children}</div>
    </AppShell>
  );
}
