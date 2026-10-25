import * as Crumb from "@/components/superthread/ui/breadcrumb";
import { State, States } from "@/examples/input";
export function BreadcrumbExample({ collapsed = false, slash = false }: { collapsed?: boolean; slash?: boolean }) {
  return (
    <Crumb.Breadcrumb>
      <Crumb.BreadcrumbList>
        <Crumb.BreadcrumbItem>
          <Crumb.BreadcrumbLink href="/">superthread</Crumb.BreadcrumbLink>
        </Crumb.BreadcrumbItem>
        <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
        {collapsed ? (
          <>
            <Crumb.BreadcrumbItem>
              <a href="/install#items" aria-label="show all components">
                <Crumb.BreadcrumbEllipsis />
              </a>
            </Crumb.BreadcrumbItem>
            <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
          </>
        ) : (
          <>
            <Crumb.BreadcrumbItem>
              <Crumb.BreadcrumbLink href="/install#items">components</Crumb.BreadcrumbLink>
            </Crumb.BreadcrumbItem>
            <Crumb.BreadcrumbSeparator>{slash ? "/" : undefined}</Crumb.BreadcrumbSeparator>
          </>
        )}
        <Crumb.BreadcrumbItem>
          <Crumb.BreadcrumbPage>breadcrumb</Crumb.BreadcrumbPage>
        </Crumb.BreadcrumbItem>
      </Crumb.BreadcrumbList>
    </Crumb.Breadcrumb>
  );
}
export function BreadcrumbStates() {
  return (
    <States>
      {["rest", "hover", "focus", "current"].map((state) => (
        <State
          key={state}
          name={state}
          note={
            state === "current"
              ? "foreground, aria-current page"
              : state === "focus"
                ? "outside house ring"
                : state === "hover"
                  ? "link takes foreground ink"
                  : "muted instrument link"
          }
        >
          <Crumb.Breadcrumb>
            <Crumb.BreadcrumbList>
              <Crumb.BreadcrumbItem>
                {state === "current" ? (
                  <Crumb.BreadcrumbPage>breadcrumb</Crumb.BreadcrumbPage>
                ) : (
                  <Crumb.BreadcrumbLink
                    href="/install#items"
                    tabIndex={-1}
                    data-demo={state === "focus" ? "focus-visible" : state}
                  >
                    components
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
      <State name="collapsed" note="more glyph names the omitted stretch" className="st-gl-full">
        <BreadcrumbExample collapsed />
      </State>
      <State name="separator" note="a slash in place of the default pixel chevron" className="st-gl-full">
        <BreadcrumbExample slash />
      </State>
    </div>
  );
}
