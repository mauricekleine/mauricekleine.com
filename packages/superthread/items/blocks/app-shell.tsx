import type { ComponentProps, ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/superthread/ui/sidebar";

// The ship's frame delegates its marks, links and sidebar to the fleet rail. The wrapper claims only the block.
function AppShell(props: ComponentProps<typeof FleetRail>) {
  return (
    <div data-mk="app-shell" data-slot="app-shell" className="contents">
      <FleetRail {...props} />
    </div>
  );
}

// The ship's name lines up with home in the rail. Below 900 px the name yields to a wrapped row of links.
// Its banner keeps the ship's name and named navigation in one landmark. Passing foot, even null, runs the column to the
// frame's full height and holds a 37 px slot at its bottom, so a line that comes and goes moves nothing; the slot's rule
// prints with its line, and the slot yields below 900 px.
function AppShellNav({
  ship,
  foot,
  children,
  className,
  role = "banner",
  ...props
}: ComponentProps<"div"> & { ship: string; foot?: ReactNode }) {
  const footed = foot !== undefined;
  return (
    <div
      data-mk="app-shell"
      data-slot="app-shell-nav"
      role={role}
      className={cn(
        "min-w-0",
        footed && "flex min-h-[calc(100svh-2rem)] flex-col [@media(max-width:900px)]:min-h-0",
        className,
      )}
      {...props}
    >
      <SidebarHeader className="h-[59px] justify-center border-b border-sidebar-border px-2.5 py-0 type-subtitle [@media(max-width:900px)]:hidden">
        {ship}
      </SidebarHeader>
      <SidebarContent className="overflow-visible py-2 [@media(max-width:900px)]:py-0">
        <nav aria-label={ship} className="flex min-h-0 flex-1">
          <SidebarMenu className="[@media(max-width:900px)]:flex-row [@media(max-width:900px)]:flex-wrap [@media(max-width:900px)]:gap-x-1 [@media(max-width:900px)]:gap-y-3">
            {children}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      {footed && (
        <div
          data-slot="app-shell-nav-foot"
          className="h-[37px] shrink-0 truncate border-t border-sidebar-border px-2.5 pt-3 pb-1 type-instrument text-muted-foreground empty:border-t-transparent [@media(max-width:900px)]:hidden [&>a]:link-quiet"
        >
          {foot}
        </div>
      )}
    </div>
  );
}

// A nav link keeps the sidebar item's neutral current state; numbers and changing counts print in mono. Below 900 px it
// is 32 px with a 44 px hit area, measured from the menu item, so the sidebar button's clip leaves the area alone, and
// wrapped rows keep that 44 px pitch.
function AppShellNavItem({
  isActive = false,
  render = <a />,
  number,
  count,
  children,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuButton> & { number?: ReactNode; count?: ReactNode }) {
  return (
    <SidebarMenuItem data-mk="app-shell" data-slot="app-shell-nav-item" className="min-w-0">
      <SidebarMenuButton
        render={render}
        isActive={isActive}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:900px)]:h-8 [@media(max-width:600px)]:h-8 [@media(max-width:900px)]:w-auto [@media(max-width:900px)]:hit-area",
          className,
        )}
        {...props}
      >
        {number != null && (
          <span data-slot="app-shell-nav-number" className="type-instrument font-mono tabular-nums">
            {number}
          </span>
        )}
        <span data-slot="app-shell-nav-label" className="min-w-0 truncate">
          {children}
        </span>
        {count != null && (
          <span
            data-slot="app-shell-nav-count"
            aria-live="polite"
            aria-atomic="true"
            className="ml-auto shrink-0 type-instrument font-mono text-muted-foreground tabular-nums"
          >
            {count}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// The app's ground starts level with the frame and keeps 12 px beside the working panel below 900 px.
// It is the page's main, named workspace, and the rail's skip link lands on it, so it takes focus and prints no ring;
// render a div when the app's layout already owns main. Inside another landmark, pass role="group" to AppShellNav.
// The ground is dark in both modes, so a nav drawn on it holds the selected role and the ring to the ground's words and
// the sidebar's pale ring: plum falls short of a ring's contrast there.
function AppShellGround({ className, render, ...props }: useRender.ComponentProps<"main">) {
  return useRender({
    render: render ?? <main />,
    state: { slot: "app-shell-ground", mk: "app-shell" },
    props: mergeProps<"main">(
      {
        id: render ? undefined : "main",
        tabIndex: render ? undefined : -1,
        "aria-label": render ? undefined : "workspace",
        className: cn(
          "min-w-0 flex-1 pt-4 pr-12 pb-[72px] pl-8 text-ground-foreground outline-0 [--ring:var(--sidebar-ring)] [--selected:var(--ground-foreground)] [@media(max-width:900px)]:px-3 [@media(max-width:900px)]:pt-0 [@media(max-width:900px)]:pb-10",
          className,
        ),
      },
      props,
    ),
  });
}

// The working panel takes the sheet lift on the deep ground, with the board's measure and phone padding. One width
// everywhere: no ship widens it, so main content holds its place between pages. It is a size container, so what prints
// inside it answers to the panel's width. It is paper again, so the selected role returns to the page's foreground and
// the ring to the house ink. The base layer prints a plain anchor in it as a foreground link and wraps its text anywhere.
// A div by default; render it as the app's own main or section when the layout asks.
function AppShellPanel({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    render: render ?? <div />,
    state: { slot: "app-shell-panel", mk: "app-shell" },
    props: mergeProps<"div">(
      {
        className: cn(
          "@container/panel w-full min-w-0 max-w-[880px] bg-card px-(--spacing-panel-inset) pt-10 pb-7 text-card-foreground shadow-sheet [--ring:var(--primary)] [--selected:var(--foreground)] [@media(max-width:600px)]:pt-7 [@media(max-width:600px)]:pb-4",
          className,
        ),
      },
      props,
    ),
  });
}

// The panel's closing row: a rule across its full width and 48 px of links, last in the panel, so it reaches the sheet's
// edges and its bottom. A span prints as the muted lead word. Its links read as chrome, underlined on hover, and on a
// phone each one is a 44 px box, so neighbours' areas never overlap. A footer by default; render a named nav for a row of
// links.
function AppShellPanelFoot({ className, render, ...props }: useRender.ComponentProps<"footer">) {
  return useRender({
    render: render ?? <footer />,
    state: { slot: "app-shell-panel-foot", mk: "app-shell" },
    props: mergeProps<"footer">(
      {
        className: cn(
          "-mx-(--spacing-panel-inset) mt-3 -mb-7 flex min-h-12 flex-wrap items-center gap-x-6 border-t border-border px-(--spacing-panel-inset) type-ui text-foreground [&>a]:relative [&>a]:decoration-1 [&>a]:underline-offset-4 [&>a]:no-underline [&>a:hover]:underline [&>span]:type-instrument [&>span]:text-muted-foreground [@media(max-width:600px)]:mt-2 [@media(max-width:600px)]:-mb-4 [@media(max-width:600px)]:gap-x-3 [@media(max-width:600px)]:[&>a]:flex [@media(max-width:600px)]:[&>a]:min-h-11 [@media(max-width:600px)]:[&>a]:min-w-11 [@media(max-width:600px)]:[&>a]:items-center [@media(max-width:600px)]:[&>a]:justify-center",
          className,
        ),
      },
      props,
    ),
  });
}

export { AppShell, AppShellGround, AppShellNav, AppShellNavItem, AppShellPanel, AppShellPanelFoot };
