import type { ReactNode } from "react";

import { fleet, type ShipId } from "@/components/superthread/lib/fleet";
import { cn } from "@/components/superthread/lib/utils";
import { Sidebar, SidebarProvider } from "@/components/superthread/ui/sidebar";
import { TooltipProvider } from "@/components/superthread/ui/tooltip";

const MARK_BASE = "https://superthread.mauricekleine.com/marks";

// The rail and the ship's nav print on the deep ground. Every cell is a 32 px mark; hover or focus inverts the
// cell, swaps in the light mark and slides the name out as a joined tab. At 900 px and below the rail is a bar.
const nav =
  "relative z-20 flex w-[58px] shrink-0 flex-col border border-sidebar-border [@media(max-width:900px)]:w-max [@media(max-width:900px)]:flex-row";
const home =
  "grid h-[57px] shrink-0 place-items-center border-b border-sidebar-border [@media(max-width:900px)]:h-auto [@media(max-width:900px)]:w-[49px] [@media(max-width:900px)]:border-r [@media(max-width:900px)]:border-b-0";
const list =
  "flex flex-col py-1 [@media(max-width:900px)]:flex-row [@media(max-width:900px)]:px-0.5 [@media(max-width:900px)]:py-0";
const cell =
  "group/cell relative m-1 grid h-12 place-items-center border border-transparent transition-colors duration-(--duration-quick) ease-(--ease-brand) motion-reduce:transition-none [@media(max-width:900px)]:mx-0.5 [@media(max-width:900px)]:size-10";
const linked =
  "hover:border-sidebar-foreground hover:bg-sidebar-foreground focus-visible:border-sidebar-foreground focus-visible:bg-sidebar-foreground";
const boxed =
  "border-sidebar-primary bg-sidebar-accent after:absolute after:-right-px after:-bottom-px after:size-2 after:bg-sidebar-primary after:content-['']";
const tab =
  "pointer-events-none absolute top-[-1px] bottom-[-1px] left-full z-30 flex items-center bg-sidebar-foreground pr-[18px] pl-[14px] text-summary font-medium whitespace-nowrap text-sidebar [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-(--duration-quick) ease-(--ease-brand) motion-reduce:transition-none group-hover/cell:[clip-path:inset(0)] group-focus-visible/cell:[clip-path:inset(0)] [@media(max-width:900px)]:top-full [@media(max-width:900px)]:bottom-auto [@media(max-width:900px)]:left-[-1px] [@media(max-width:900px)]:pt-2.5 [@media(max-width:900px)]:pb-3 [@media(max-width:900px)]:[clip-path:inset(0_0_100%_0)] [@media(max-width:900px)]:group-hover/cell:[clip-path:inset(0)] [@media(max-width:900px)]:group-focus-visible/cell:[clip-path:inset(0)]";
// From the fourth cell on, the bar's tab hangs right so it stays on screen.
const tabEnd =
  "[@media(max-width:900px)]:right-[-1px] [@media(max-width:900px)]:left-auto [@media(max-width:900px)]:pr-[14px] [@media(max-width:900px)]:pl-[18px]";

export function FleetRail({
  current,
  sidebar,
  children,
  hrefs = {},
  markBase = MARK_BASE,
  label = "fleet",
}: {
  // the id of the ship this surface is
  current: string;
  // the ship's own nav, beside the rail on the same ground
  sidebar?: ReactNode;
  children?: ReactNode;
  // where each cell goes, and "home" for the superthread mark; a ship without one is a disabled cell
  hrefs?: Partial<Record<ShipId | "home", string>>;
  // the folder holding <id>/<id>.svg and <id>/<id>-dark.svg
  markBase?: string;
  // the rail's accessible name
  label?: string;
}) {
  const base = markBase.replace(/\/+$/, "");
  const mark = (id: string, file: string) => `${base}/${id}/${file}`;
  const homeMark = <img src={mark("superthread", "superthread-dark.svg")} alt="" width={32} height={32} />;

  return (
    <TooltipProvider>
      <SidebarProvider
        data-mk="fleet-rail"
        className="bg-sidebar text-sidebar-foreground [--ring:var(--sidebar-ring)] [@media(max-width:900px)]:flex-col"
      >
        <div
          data-slot="fleet-rail-frame"
          className="flex shrink-0 items-start gap-4 p-4 [@media(max-width:900px)]:flex-col"
        >
          <nav data-slot="fleet-rail" aria-label={label} className={nav}>
            {hrefs.home ? (
              <a data-slot="fleet-rail-home" href={hrefs.home} aria-label="superthread" className={home}>
                {homeMark}
              </a>
            ) : (
              <span data-slot="fleet-rail-home" role="img" aria-label="superthread" className={home}>
                {homeMark}
              </span>
            )}
            <ul className={list}>
              {fleet.map((ship, index) => {
                const href = hrefs[ship.id];
                const isCurrent = current === ship.id;
                const name = (
                  <span data-slot="fleet-rail-label" className={cn(tab, index >= 3 && tabEnd)}>
                    {ship.name}
                  </span>
                );
                const dark = mark(ship.id, ship.mark.dark);

                return (
                  <li key={ship.id}>
                    {href ? (
                      <a
                        data-slot="fleet-rail-cell"
                        href={href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(cell, linked, isCurrent && boxed)}
                      >
                        <img
                          src={dark}
                          alt=""
                          width={32}
                          height={32}
                          className="group-hover/cell:hidden group-focus-visible/cell:hidden"
                        />
                        <img
                          src={mark(ship.id, ship.mark.light)}
                          alt=""
                          width={32}
                          height={32}
                          className="hidden group-hover/cell:block group-focus-visible/cell:block"
                        />
                        {name}
                      </a>
                    ) : (
                      <span
                        data-slot="fleet-rail-cell"
                        role="link"
                        aria-disabled="true"
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(cell, isCurrent && boxed)}
                      >
                        <img src={dark} alt="" width={32} height={32} className={cn(!isCurrent && "opacity-50")} />
                        {name}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          {sidebar && (
            <Sidebar collapsible="none" className="h-auto w-[150px] [@media(max-width:900px)]:w-full">
              {sidebar}
            </Sidebar>
          )}
        </div>
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
