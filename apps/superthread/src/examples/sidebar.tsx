import { StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/superthread/ui/sidebar";

const pages = ["board", "direction", "agents", "settings"];

const runs: { id: string; state: StatusState }[] = [
  { id: "or-412", state: "running" },
  { id: "or-409", state: "waiting" },
  { id: "or-406", state: "failed" },
  { id: "or-411", state: "done" },
];

// Orbit's nav: the ship's name, its pages with the board current, and its latest runs. The provider holds a full
// viewport's height unless told otherwise, so a sidebar inside a page passes min-h-0.
export function SidebarExample() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none">
        <SidebarHeader className="h-[57px] justify-center px-[19px] py-0">
          <p className="type-subtitle">orbit</p>
        </SidebarHeader>
        <SidebarSeparator className="mx-0" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page}>
                  <SidebarMenuButton isActive={page === "board"}>
                    <span>{page}</span>
                  </SidebarMenuButton>
                  {page === "agents" && <SidebarMenuBadge>3</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>runs</SidebarGroupLabel>
            <SidebarMenu>
              {runs.map((run) => (
                <SidebarMenuItem key={run.id}>
                  <SidebarMenuButton>
                    <StatusGlyph state={run.state} />
                    <span>
                      {run.id} · {run.state}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

const states: { label: string; demo?: string; active?: boolean; disabled?: boolean }[] = [
  { label: "rest" },
  { label: "hover", demo: "hover" },
  { label: "focus", demo: "focus-visible" },
  { label: "current", active: true },
  { label: "disabled", disabled: true },
];

// The menu button's states, printed: data-demo holds hover and focus, isActive marks the current page. Inert, so the
// print takes no pointer and no focus.
export function SidebarStates() {
  return (
    <div className="st-c-print" inert>
      <SidebarProvider className="min-h-0">
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {states.map((state) => (
                  <SidebarMenuItem key={state.label}>
                    <SidebarMenuButton data-demo={state.demo} isActive={state.active} disabled={state.disabled}>
                      <span>{state.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
