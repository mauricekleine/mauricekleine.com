import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

// The root starts the rule; each row carries the next one edge to edge.
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-mk="accordion"
      className={cn("flex w-full flex-col border-t border-border", className)}
      {...props}
    />
  );
}

// Each item closes with a quiet 1 px rule.
function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

// A full-width row keeps its ring inside and turns one chevron when open.
function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex min-h-12 w-full flex-1 items-start justify-between gap-2.5 py-3 text-left text-ui font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) aria-disabled:pointer-events-none aria-disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled",
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          name="chevron"
          className="pointer-events-none mt-1 ml-auto shrink-0 text-muted-foreground transition-[rotate] duration-(--duration-quick) ease-(--ease-brand) group-aria-expanded/accordion-trigger:rotate-180"
          data-slot="accordion-trigger-icon"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// Base UI measures the panel; height travels while the inner copy keeps its own padding.
function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-(--duration-quick) ease-(--ease-brand) data-starting-style:h-0 data-ending-style:h-0"
      {...props}
    >
      <div
        className={cn(
          "pb-4 text-ui text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
