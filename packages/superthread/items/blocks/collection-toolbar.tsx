import * as React from "react";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";
import { ToggleGroup, ToggleGroupItem } from "@/components/superthread/ui/toggle-group";

// The row above a collection: related controls stay together and wrap before the collection starts.
function CollectionToolbar({
  className,
  label = "collection controls",
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <div
      data-mk="collection-toolbar"
      data-slot="collection-toolbar"
      role="group"
      aria-label={label}
      className={cn("mb-6 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3", className)}
      {...props}
    />
  );
}

// A named set of controls, with its quiet label beside them and room to wrap on a phone.
function ToolbarGroup({ className, label, children, ...props }: React.ComponentProps<"div"> & { label: string }) {
  const labelId = React.useId();
  return (
    <div
      data-mk="collection-toolbar"
      data-slot="toolbar-group"
      role="group"
      aria-labelledby={labelId}
      className={cn("flex min-w-0 max-w-full flex-wrap items-center gap-2", className)}
      {...props}
    >
      <span id={labelId} className="type-meta text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

// Spare space pushes sort and view controls to the far end without fixing their position on narrow screens.
function ToolbarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-mk="collection-toolbar"
      data-slot="toolbar-spacer"
      aria-hidden="true"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

// The active filter is boxed in the house ink. Its clear control keeps its own ring inside the box.
function FilterChip({
  className,
  children,
  shown,
  total,
  onClear,
  clearLabel = "clear filter",
  ...props
}: React.ComponentProps<"div"> & { shown?: number; total?: number; onClear: () => void; clearLabel?: string }) {
  return (
    <div
      data-mk="collection-toolbar"
      data-slot="filter-chip"
      className={cn(
        "flex min-h-10 min-w-0 max-w-full items-center gap-2 border border-primary bg-accent pl-3 text-ui text-foreground",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      {shown !== undefined && total !== undefined && <ToolbarCount shown={shown} total={total} />}
      <button
        data-slot="filter-chip-clear"
        type="button"
        aria-label={clearLabel}
        onClick={onClear}
        className="flex w-10 shrink-0 items-center justify-center self-stretch transition-[background-color] duration-(--duration-instant) ease-(--ease-brand) hover:bg-control-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

// The number of results, read out when a filter changes it. Zero is a result too.
function ToolbarCount({
  className,
  shown,
  total,
  ...props
}: React.ComponentProps<"span"> & { shown: number; total: number }) {
  return (
    <span
      data-mk="collection-toolbar"
      data-slot="toolbar-count"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "shrink-0 type-instrument whitespace-nowrap text-muted-foreground font-mono tabular-nums",
        className,
      )}
      {...props}
    >
      {shown} of {total}
    </span>
  );
}

type View = { value: string; label: string };
type ViewSwitchProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  views: readonly [View, ...View[]];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
};

// One view stays pressed. The app may keep it in the URL, or let the switch remember it locally.
function ViewSwitch({
  className,
  views,
  value,
  defaultValue,
  onValueChange,
  label = "view",
  disabled,
  ...props
}: ViewSwitchProps) {
  const [localValue, setLocalValue] = React.useState(defaultValue ?? views[0].value);
  const requested = value ?? localValue;
  const selected = views.some((view) => view.value === requested) ? requested : views[0].value;
  return (
    <div
      data-mk="collection-toolbar"
      data-slot="view-switch"
      className={cn("min-w-0 max-w-full", className)}
      {...props}
    >
      <ToggleGroup
        aria-label={label}
        multiple={false}
        variant="outline"
        spacing={0}
        disabled={disabled}
        value={[selected]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === undefined || next === selected) return;
          if (value === undefined) setLocalValue(next);
          onValueChange?.(next);
        }}
        className="max-w-full flex-wrap"
      >
        {views.map((view) => (
          <ToggleGroupItem key={view.value} value={view.value}>
            {view.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export { CollectionToolbar, ToolbarGroup, ToolbarSpacer, FilterChip, ToolbarCount, ViewSwitch };
