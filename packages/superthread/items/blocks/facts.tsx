import { cn } from "@/components/superthread/lib/utils";

// Labelled values as shared columns, or ruled cells with the label above. Phones keep one cell per line.
function Facts({
  className,
  layout = "list",
  columns = 2,
  ...props
}: React.ComponentProps<"dl"> & { layout?: "list" | "grid"; columns?: 2 | 3 | 4 }) {
  return (
    <dl
      data-mk="facts"
      data-slot="facts"
      data-layout={layout}
      data-columns={columns}
      className={cn(
        "group/facts grid min-w-0 border-t border-border data-[layout=list]:grid-cols-[max-content_minmax(0,1fr)] data-[layout=list]:gap-x-6 data-[layout=grid]:border-l data-[layout=grid]:grid-cols-1 [@media(min-width:601px)]:data-[layout=grid]:data-[columns=2]:grid-cols-2 [@media(min-width:601px)]:data-[layout=grid]:data-[columns=3]:grid-cols-3 [@media(min-width:601px)]:data-[layout=grid]:data-[columns=4]:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}

// A semantic term/value pair keeps its rule across both columns in the list.
function Fact({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fact"
      className={cn(
        "grid min-w-0 gap-y-2 border-b border-border py-3 group-data-[layout=list]/facts:col-span-full group-data-[layout=list]/facts:grid-cols-subgrid group-data-[layout=list]/facts:items-baseline group-data-[layout=grid]/facts:content-start group-data-[layout=grid]/facts:border-r group-data-[layout=grid]/facts:px-4 group-data-[layout=grid]/facts:py-4",
        className,
      )}
      {...props}
    />
  );
}

// The quiet label stays narrow enough to leave room for a long value on a phone.
function FactLabel({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="fact-label"
      className={cn(
        "min-w-0 type-instrument text-muted-foreground [overflow-wrap:anywhere] group-data-[layout=list]/facts:max-w-[min(24ch,35vw)]",
        className,
      )}
      {...props}
    />
  );
}

// Numbers align at the list's far edge; identifiers keep their mono face without changing alignment.
function FactValue({ className, kind, ...props }: React.ComponentProps<"dd"> & { kind?: "number" | "id" }) {
  return (
    <dd
      data-slot="fact-value"
      data-kind={kind}
      className={cn(
        "min-w-0 text-ui [overflow-wrap:anywhere] data-[kind=number]:font-mono data-[kind=number]:tabular-nums data-[kind=id]:font-mono data-[kind=id]:tabular-nums group-data-[layout=list]/facts:data-[kind=number]:text-right",
        className,
      )}
      {...props}
    />
  );
}

export { Facts, Fact, FactLabel, FactValue };
