import * as Crumb from "@/components/superthread/ui/breadcrumb";
import { State, States } from "@/examples/input";
export function BreadcrumbExample({ collapsed = false, slash = false }: { collapsed?: boolean; slash?: boolean }) {
  return (
    <Crumb.Breadcrumb>
      <Crumb.BreadcrumbList>
        <Crumb.BreadcrumbItem>
          <Crumb.BreadcrumbLink href="/">Superthread</Crumb.BreadcrumbLink>
        </Crumb.BreadcrumbItem>
        <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
        {collapsed ? (
          <>
            <Crumb.BreadcrumbItem>
              <a href="/install#items" aria-label="Show all components">
                <Crumb.BreadcrumbEllipsis />
              </a>
            </Crumb.BreadcrumbItem>
            <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
          </>
        ) : (
          <>
            <Crumb.BreadcrumbItem>
              <Crumb.BreadcrumbLink href="/install#items">Components</Crumb.BreadcrumbLink>
            </Crumb.BreadcrumbItem>
            <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
          </>
        )}
        <Crumb.BreadcrumbItem>
          <Crumb.BreadcrumbPage>Breadcrumb</Crumb.BreadcrumbPage>
        </Crumb.BreadcrumbItem>
      </Crumb.BreadcrumbList>
    </Crumb.Breadcrumb>
  );
}
export function BreadcrumbStates() {
  return (
    <States>
      {(
        [
          ["rest", "Rest", "Muted instrument link"],
          ["hover", "Hover", "Link takes foreground ink"],
          ["focus", "Focus", "Outside house ring"],
          ["current", "Current", "Foreground, aria-current page"],
        ] as const
      ).map(([state, name, note]) => (
        <State key={state} name={name} note={note}>
          <Crumb.Breadcrumb>
            <Crumb.BreadcrumbList>
              <Crumb.BreadcrumbItem>
                {state === "current" ? (
                  <Crumb.BreadcrumbPage>Breadcrumb</Crumb.BreadcrumbPage>
                ) : (
                  <Crumb.BreadcrumbLink
                    href="/install#items"
                    tabIndex={-1}
                    data-demo={state === "focus" ? "focus-visible" : state}
                  >
                    Components
                  </Crumb.BreadcrumbLink>
                )}
              </Crumb.BreadcrumbItem>
            </Crumb.BreadcrumbList>
          </Crumb.Breadcrumb>
        </State>
      ))}
    </States>
  );
}
export function BreadcrumbVariants() {
  return (
    <div className="st-gl-stack">
      <State name="Collapsed" note="More glyph names the omitted stretch" className="st-gl-full">
        <BreadcrumbExample collapsed />
      </State>
      <State name="Separator" note="A slash in place of the default pixel chevron" className="st-gl-full">
        <BreadcrumbExample slash />
      </State>
    </div>
  );
}
