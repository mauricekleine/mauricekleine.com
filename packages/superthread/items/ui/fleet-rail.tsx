import { type ReactNode, useId } from "react";

import { fleet, home as homeShip, type ShipId } from "@/components/superthread/lib/fleet";
import { toggleTheme, useTheme } from "@/components/superthread/lib/theme";
import { cn } from "@/components/superthread/lib/utils";
import { Sidebar, SidebarProvider } from "@/components/superthread/ui/sidebar";
import { TooltipProvider } from "@/components/superthread/ui/tooltip";

const MARK_BASE = "https://superthread.mauricekleine.com/marks";

// The rail and the ship's nav print on the deep ground. Every cell is a 32 px mark; hover or focus inverts the
// cell, swaps in the light mark and slides out a joined tab, the ship's name over its descriptor. At 900 px and below
// the rail is a bar. The frame stays in view as the page scrolls, and the rail's last cell is the fleet's one mode
// control, so a ship adds neither.
//
// The ground keeps the mode it is in, and the frame on it (the rail and the ship's sidebar) prints in the dark palette
// in both modes, as the world's gutter does. GROUND holds the ground's roles where the frame paints them, and
// ON_GROUND opens the dark scope and pins them back, important so they outrank the token block's .dark, with the
// current item held to the words beside it. The page beside the frame stays in the page's mode. The sidebar item
// scopes its own content the same way.
const GROUND =
  "[--sidebar-ground:var(--sidebar)] [--sidebar-ground-foreground:var(--sidebar-foreground)] [--sidebar-ground-hover:var(--sidebar-hover)]";
const ON_GROUND =
  "dark [--sidebar:var(--sidebar-ground)]! [--sidebar-foreground:var(--sidebar-ground-foreground)]! [--sidebar-hover:var(--sidebar-ground-hover)]! [--selected:var(--sidebar-foreground)]!";
const nav =
  "relative z-20 flex w-[58px] shrink-0 flex-col border border-sidebar-border [@media(max-width:900px)]:w-max [@media(max-width:900px)]:flex-row";
const home =
  "grid h-[57px] shrink-0 place-items-center border-b border-sidebar-border [@media(max-width:900px)]:h-auto [@media(max-width:900px)]:w-[49px] [@media(max-width:900px)]:border-r [@media(max-width:900px)]:border-b-0 [@media(max-width:420px)]:w-10!";
const list =
  "flex flex-col py-1 [@media(max-width:900px)]:flex-row [@media(max-width:900px)]:px-0.5 [@media(max-width:900px)]:py-0";
const modeSlot =
  "border-t border-sidebar-border py-1 [@media(max-width:900px)]:border-t-0 [@media(max-width:900px)]:border-l [@media(max-width:900px)]:px-0.5 [@media(max-width:900px)]:py-0";
const cell =
  "group/cell relative m-1 grid h-12 place-items-center border border-transparent transition-[color,background-color,border-color] duration-(--duration-quick) ease-(--ease-brand) motion-reduce:transition-none [@media(max-width:900px)]:mx-0.5 [@media(max-width:900px)]:size-10 [@media(max-width:420px)]:mx-0! [@media(max-width:420px)]:size-9!";
const linked =
  "hover:border-foreground hover:bg-foreground focus-visible:border-foreground focus-visible:bg-foreground";
// The current cell is neutral, with an 8 px plum corner mark, the only plum on a cell's edge.
const here =
  "border-sidebar-border after:absolute after:-right-px after:-bottom-px after:size-2 after:bg-sidebar-primary after:content-['']";
// The tab hides two ways, clipped to its left edge on the rail and to its top edge on the bar, so it is also invisible
// while hidden: crossing 900 px moves the clip from one form to the other, and that move never shows. The visibility
// turns on as the tab opens and off once it has closed, so the slide plays in full; the cell carries the ship's name.
const tab =
  "pointer-events-none invisible absolute top-[-1px] bottom-[-1px] left-full z-30 flex flex-col justify-center gap-0.5 bg-foreground pr-[18px] pl-[14px] whitespace-nowrap text-background [clip-path:inset(0_100%_0_0)] transition-[clip-path,visibility] duration-(--duration-quick) ease-(--ease-brand) motion-reduce:transition-none group-hover/cell:visible group-hover/cell:[clip-path:inset(0)] group-focus-visible/cell:visible group-focus-visible/cell:[clip-path:inset(0)] [@media(max-width:900px)]:top-full [@media(max-width:900px)]:bottom-auto [@media(max-width:900px)]:left-[-1px] [@media(max-width:900px)]:pt-2.5 [@media(max-width:900px)]:pb-3 [@media(max-width:900px)]:[clip-path:inset(0_0_100%_0)] [@media(max-width:900px)]:group-hover/cell:[clip-path:inset(0)] [@media(max-width:900px)]:group-focus-visible/cell:[clip-path:inset(0)]";
// From the fourth cell on, the bar's tab hangs right so it stays on screen.
const tabEnd =
  "[@media(max-width:900px)]:right-[-1px] [@media(max-width:900px)]:left-auto [@media(max-width:900px)]:pr-[14px] [@media(max-width:900px)]:pl-[18px] [@media(max-width:900px)]:text-right";
// The tab prints the name over the ship's one-line descriptor. The tab is the dark frame's foreground, the light stock,
// so the descriptor takes the light palette's muted ink: it opens a light scope of its own.
const tabName = "text-summary/[18px] font-medium";
const tabDesc = "light text-[12px]/[16px] text-muted-foreground";

// The way past the frame, off the page until focus lands on it: the first stop on the page, to #main.
const skip = "absolute top-[-100px] left-4 z-40 bg-background p-3 text-foreground focus:top-4";

// The mode cell's glyph: a disc, half ink and half outline, in the rail's whole pixels. Its one drawing serves both
// modes, so the prerendered rail never shows the wrong one.
function ModeGlyph() {
  return (
    <svg viewBox="0 0 12 12" width={24} height={24} shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      <path d="M4 0h4v1h-4zM2 1h2v1h-2zM6 1h3v1h-3zM1 2h1v1h-1zM6 2h4v1h-4zM1 3h1v1h-1zM6 3h4v1h-4zM0 4h1v4h-1zM6 4h5v4h-5zM1 8h1v2h-1zM6 8h4v2h-4zM2 10h2v1h-2zM6 10h3v1h-3zM4 11h4v1h-4z" />
    </svg>
  );
}

export function FleetRail({
  current,
  sidebar,
  children,
  hrefs = {},
  markBase = MARK_BASE,
  label = "fleet",
  skipLink = true,
  className,
}: {
  // the id of the ship this surface is
  current: string;
  // the ship's own nav, beside the rail on the same ground
  sidebar?: ReactNode;
  children?: ReactNode;
  // where each cell goes, and "home" for the superthread mark. A ship left out links to its fleet url; null, or a
  // ship with no url, is a disabled cell
  hrefs?: Partial<Record<ShipId | "home", string | null>>;
  // the folder holding <id>/<id>.svg and <id>/<id>-dark.svg
  markBase?: string;
  // the rail's accessible name
  label?: string;
  // false for a rail embedded in a page that owns its own skip link
  skipLink?: boolean;
  // classes for the wrapper that paints the ground and holds the rail, its nav and the page
  className?: string;
}) {
  const uid = useId();
  const theme = useTheme();
  const base = markBase.replace(/\/+$/, "");
  const mark = (id: string, file: string) => `${base}/${id}/${file}`;
  const homeMark = <img src={mark("superthread", "superthread-dark.svg")} alt="" width={32} height={32} />;
  const homeHref = hrefs.home === undefined ? homeShip.url : hrefs.home;
  const ships = fleet.filter((ship) => ship.rail);

  return (
    <TooltipProvider>
      <SidebarProvider
        data-mk="fleet-rail"
        className={cn(
          "bg-sidebar text-sidebar-foreground [--ring:var(--sidebar-ring)] [@media(max-width:900px)]:flex-col",
          GROUND,
          className,
        )}
      >
        {skipLink && (
          <a data-slot="fleet-rail-skip" href="#main" className={skip}>
            skip to content
          </a>
        )}
        <div
          data-slot="fleet-rail-frame"
          className={cn(
            "sticky top-0 z-20 flex max-h-svh shrink-0 items-start gap-4 self-start p-4 [@media(max-width:900px)]:static [@media(max-width:900px)]:max-h-none [@media(max-width:900px)]:flex-col [@media(max-width:900px)]:self-stretch [@media(max-width:420px)]:p-3",
            ON_GROUND,
          )}
        >
          <nav data-slot="fleet-rail" aria-label={label} className={nav}>
            {homeHref ? (
              <a data-slot="fleet-rail-home" href={homeHref} aria-label="superthread" className={home}>
                {homeMark}
              </a>
            ) : (
              <span data-slot="fleet-rail-home" role="img" aria-label="superthread" className={home}>
                {homeMark}
              </span>
            )}
            <ul className={list}>
              {ships.map((ship, index) => {
                const given = hrefs[ship.id];
                const href = given === undefined ? ship.url : given;
                const isCurrent = current === ship.id;
                const describedBy = `${uid}-${ship.id}`;
                const name = (
                  <span data-slot="fleet-rail-label" className={cn(tab, index >= 3 && tabEnd)}>
                    <span className={tabName}>{ship.name}</span>
                    <span data-slot="fleet-rail-description" id={describedBy} className={tabDesc}>
                      {ship.desc}
                    </span>
                  </span>
                );
                const dark = mark(ship.id, ship.mark.dark);

                return (
                  <li key={ship.id}>
                    {href ? (
                      <a
                        data-slot="fleet-rail-cell"
                        href={href}
                        aria-label={ship.name}
                        aria-describedby={describedBy}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(cell, linked, isCurrent && here)}
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
                        aria-label={ship.name}
                        aria-describedby={describedBy}
                        aria-disabled="true"
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(cell, isCurrent && here)}
                      >
                        <img src={dark} alt="" width={32} height={32} className={cn(!isCurrent && "opacity-50")} />
                        {name}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className={modeSlot}>
              <button
                data-slot="fleet-rail-mode"
                type="button"
                aria-label="dark mode"
                aria-describedby={`${uid}-mode`}
                aria-pressed={theme === null ? undefined : theme === "dark"}
                onClick={toggleTheme}
                className={cn(
                  cell,
                  linked,
                  "w-[calc(100%-0.5rem)] cursor-pointer text-foreground hover:text-background focus-visible:text-background [@media(max-width:900px)]:w-auto",
                )}
              >
                <ModeGlyph />
                <span data-slot="fleet-rail-label" className={cn(tab, tabEnd)}>
                  <span className={tabName}>dark mode</span>
                  <span data-slot="fleet-rail-description" id={`${uid}-mode`} className={tabDesc}>
                    across the whole fleet
                  </span>
                </span>
              </button>
            </div>
          </nav>
          {sidebar && (
            <Sidebar
              collapsible="none"
              className="h-auto max-h-[calc(100svh-2rem)] w-[150px] overflow-y-auto [@media(max-width:900px)]:max-h-none [@media(max-width:900px)]:w-full [@media(max-width:900px)]:overflow-visible"
            >
              {sidebar}
            </Sidebar>
          )}
        </div>
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
