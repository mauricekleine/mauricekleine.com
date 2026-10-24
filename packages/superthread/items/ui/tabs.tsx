import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-mk="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-4 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

// Tabs sit on a rule: the default list draws its own 1 px rule under the tabs, the full width of its box; the line
// list leaves the rule to the page, for tabs that sit on one the page already draws. Stacked, the tabs keep their
// bars and the list drops its rule.
const tabsListVariants = cva(
  "group/tabs-list flex gap-7 text-muted-foreground group-data-horizontal/tabs:items-end group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-start group-data-vertical/tabs:gap-3",
  {
    variants: {
      variant: {
        default: "w-full border-b border-border group-data-vertical/tabs:w-fit group-data-vertical/tabs:border-b-0",
        line: "w-fit",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

// The current tab is solid: its word in the foreground over a 2 px bar of the house ink that covers the list's
// rule. A tab that is not current previews that bar at the half on hover (texture-tabhover, on ::after, under the
// word). Focus is the base layer's 2 px house ring at 2 px offset.
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center gap-2 pb-3 text-ui font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) hover:text-foreground disabled:pointer-events-none disabled:text-disabled aria-disabled:pointer-events-none aria-disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "data-active:text-foreground data-active:after:absolute data-active:after:inset-x-0 data-active:after:-bottom-px data-active:after:h-0.5 data-active:after:bg-primary",
        "texture-tabhover",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-ui focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
