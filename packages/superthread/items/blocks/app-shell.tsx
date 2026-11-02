import { createContext, useContext, useId, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import { Icon } from "@/components/superthread/ui/glyphs";
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

// The id of the list a nav's `...` opens, while the nav holds one.
const NavOverflow = createContext<string | null>(null);

// The ship's name lines up with home in the rail. Below 900 px the name yields to a wrapped row of links.
// Its banner keeps the ship's name and named navigation in one landmark. Passing foot, even null, runs the column to the
// frame's full height and holds a 37 px slot at its bottom, so a line that comes and goes moves nothing; the slot's rule
// prints with its line, and the slot yields below 900 px. Passing overflow, the words that name what it holds, puts the
// nav's second tier behind a `...` at the row's end at 600 px and below, boxed while the current page sits behind it, and
// tightens the row at 420 px so it holds one line down to 360.
function AppShellNav({
  ship,
  foot,
  overflow,
  children,
  className,
  role = "banner",
  ...props
}: ComponentProps<"div"> & { ship: string; foot?: ReactNode; overflow?: string }) {
  const footed = foot !== undefined;
  const id = useId();
  const listId = `${id}-more`;
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
          <SidebarMenu
            className={cn(
              "group/nav [@media(max-width:900px)]:flex-row [@media(max-width:900px)]:flex-wrap [@media(max-width:900px)]:gap-x-1 [@media(max-width:900px)]:gap-y-3",
              overflow &&
                "[@media(max-width:420px)]:gap-x-0! [@media(max-width:420px)]:[&>li>[data-slot=sidebar-menu-button]]:px-2",
            )}
            style={overflow ? ({ "--nav-more": `--more-${id.replace(/\W/g, "")}` } as CSSProperties) : undefined}
          >
            <NavOverflow.Provider value={overflow ? listId : null}>{children}</NavOverflow.Provider>
            {overflow && (
              <SidebarMenuItem
                data-mk="app-shell"
                data-slot="app-shell-nav-more"
                className="ml-auto hidden [[data-slot=quick-add-nav]~&]:ml-0 [@media(max-width:600px)]:block"
              >
                <SidebarMenuButton
                  type="button"
                  popoverTarget={listId}
                  aria-label={overflow}
                  className="w-11 justify-center px-0 text-muted-foreground [anchor-name:var(--nav-more)] group-has-[[data-slot=app-shell-nav-tier]_[aria-current=page]]/nav:border-selected group-has-[[data-slot=app-shell-nav-tier]_[aria-current=page]]/nav:text-selected hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:900px)]:h-8 [@media(max-width:900px)]:hit-area"
                >
                  <Icon name="more" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      {footed && (
        <div
          data-slot="app-shell-nav-foot"
          className="h-[37px] shrink-0 truncate border-t border-sidebar-border pt-3 pb-1 pl-2.5 type-instrument text-muted-foreground empty:border-t-transparent [@media(max-width:900px)]:hidden [&>a]:link-quiet"
        >
          {foot}
        </div>
      )}
    </div>
  );
}

// The nav's quiet second tier: a nested list under a rule, its words muted and its current item back in the nav's own
// ink. Below 900 px the rule yields and its items join the row. Under a nav with overflow, one list carries both forms:
// at 600 px and below it is a native popover the `...` opens, so its links stay the app's own and it keeps the frame's
// dark scope, and a choice in it closes it, since a client-side route keeps the page. While it's closed there its list
// item goes too, so a screen reader counts no empty item in the row. An open list prints its words in the popover's
// ink, a 44 px row each, and names the popover's fill as the surface, not the ground's. A window that grows past 600 px
// while it is open closes it, since the `...` it hangs from yields there, and its links go back to the row.
function AppShellNavTier({ className, onClick, onToggle, ...props }: ComponentProps<"ul">) {
  const listId = useContext(NavOverflow);
  return (
    <li
      data-mk="app-shell"
      data-slot="app-shell-nav-tier"
      className={cn(
        "mt-[5px] min-w-0 border-t border-sidebar-border pt-[9px] [@media(max-width:900px)]:contents",
        listId && "[@media(max-width:600px)]:has-[>ul:not(:popover-open)]:hidden",
      )}
    >
      <ul
        id={listId ?? undefined}
        popover={listId ? "auto" : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (listId && (event.target as Element).closest("a, button")) event.currentTarget.hidePopover?.();
        }}
        onToggle={(event) => {
          onToggle?.(event);
          const list = event.currentTarget;
          const phone = list.ownerDocument.defaultView?.matchMedia("(max-width: 600px)");
          if (!listId || !phone || event.newState !== "open") return;
          const close = () => {
            if (!phone.matches) list.hidePopover?.();
          };
          phone.addEventListener("change", close);
          list.addEventListener("toggle", () => phone.removeEventListener("change", close), { once: true });
        }}
        className={cn(
          "flex min-w-0 flex-col gap-1 [@media(max-width:900px)]:contents",
          listId &&
            "static m-0 size-auto overflow-visible border-0 bg-transparent p-0 text-inherit open:fixed open:inset-auto open:top-[anchor(bottom)] open:right-[anchor(right)] open:mt-1.5 open:flex open:w-max open:min-w-44 open:border open:border-border open:bg-popover open:[--surface:var(--popover)] open:p-1 open:text-popover-foreground open:shadow-leaf open:[position-anchor:var(--nav-more)] open:[&_[data-slot=sidebar-menu-button]]:h-11 open:[&_[data-slot=sidebar-menu-button]]:w-full open:[&_[data-slot=sidebar-menu-button]]:text-popover-foreground [@media(max-width:600px)]:not-open:hidden",
          className,
        )}
        {...props}
      />
    </li>
  );
}

// The nav's foot line where the nav has no foot: under the panel, 900 px and below. Pass it what the nav's foot holds, so a
// phone reads the same words, and pass it nothing and it takes no room. It's the last thing in the ground, so it opens the
// dark scope the nav prints in, and its height holds a link's hit area.
function AppShellPageFoot({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-mk="app-shell"
      data-slot="app-shell-page-foot"
      className={cn(
        "dark mt-2 hidden min-h-11 items-center px-1 type-instrument text-muted-foreground [@media(max-width:900px)]:not-empty:flex [&>a]:link-quiet",
        className,
      )}
      {...props}
    />
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
          "in-data-[slot=app-shell-nav-tier]:text-muted-foreground in-data-[slot=app-shell-nav-tier]:hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:900px)]:h-8 [@media(max-width:600px)]:h-8 [@media(max-width:900px)]:w-auto [@media(max-width:900px)]:hit-area",
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
// the ring to the house ink, and --surface names its fill for a part that knocks a line out, such as the day line's now
// mark. The base layer prints a plain anchor in it as a foreground link and wraps its text anywhere.
// A div by default; render it as the app's own main or section when the layout asks.
function AppShellPanel({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    render: render ?? <div />,
    state: { slot: "app-shell-panel", mk: "app-shell" },
    props: mergeProps<"div">(
      {
        className: cn(
          "@container/panel w-full min-w-0 max-w-[880px] bg-card px-(--spacing-panel-inset) pt-10 pb-7 text-card-foreground shadow-sheet [--ring:var(--primary)] [--selected:var(--foreground)] [--surface:var(--card)] [@media(max-width:600px)]:pt-7 [@media(max-width:600px)]:pb-4",
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

export {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellNavTier,
  AppShellPageFoot,
  AppShellPanel,
  AppShellPanelFoot,
};
