import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "@/components/superthread/lib/utils"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ className, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" className={(state) => cn("[&_[data-icon=inline-end]]:transition-[rotate] [&_[data-icon=inline-end]]:duration-(--duration-quick) [&_[data-icon=inline-end]]:ease-(--ease-brand) [&[data-panel-open]_[data-icon=inline-end]]:rotate-180", typeof className === "function" ? className(state) : className)} {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
