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
function AppShellNav({ ship, children, className, ...props }: ComponentProps<"div"> & { ship: string }) {
  return (
    <div data-mk="app-shell" data-slot="app-shell-nav" className={cn("min-w-0", className)} {...props}>
      <SidebarHeader className="h-[59px] justify-center border-b border-sidebar-border px-2.5 py-0 type-subtitle [@media(max-width:900px)]:hidden">
        {ship}
      </SidebarHeader>
      <SidebarContent className="overflow-visible py-2 [@media(max-width:900px)]:py-0">
        <nav aria-label={ship}>
          <SidebarMenu className="[@media(max-width:900px)]:flex-row [@media(max-width:900px)]:flex-wrap [@media(max-width:900px)]:gap-x-1 [@media(max-width:900px)]:gap-y-0">
            {children}
          </SidebarMenu>
        </nav>
      </SidebarContent>
    </div>
  );
}

// A nav link keeps the sidebar item's boxed current state; numbers and changing counts print in mono.
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
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:900px)]:h-8 [@media(max-width:900px)]:w-auto",
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
// It is the page's main, named workspace; render a div when the app's layout already owns main.
function AppShellGround({ className, render, ...props }: useRender.ComponentProps<"main">) {
  return useRender({
    render: render ?? <main />,
    state: { slot: "app-shell-ground", mk: "app-shell" },
    props: mergeProps<"main">(
      {
        "aria-label": render ? undefined : "workspace",
        className: cn(
          "min-w-0 flex-1 pt-4 pr-12 pb-[72px] pl-8 text-ground-foreground [@media(max-width:900px)]:px-3 [@media(max-width:900px)]:pt-0 [@media(max-width:900px)]:pb-10",
          className,
        ),
      },
      props,
    ),
  });
}

// The working panel takes the sheet lift on the deep ground, with the board's measure and phone padding.
function AppShellPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-mk="app-shell"
      data-slot="app-shell-panel"
      className={cn(
        "min-w-0 max-w-[880px] bg-card px-12 pt-10 pb-7 text-card-foreground shadow-sheet [@media(max-width:600px)]:px-4 [@media(max-width:600px)]:pt-7 [@media(max-width:600px)]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

export { AppShell, AppShellGround, AppShellNav, AppShellNavItem, AppShellPanel };
