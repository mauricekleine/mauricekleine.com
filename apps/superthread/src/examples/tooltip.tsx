import { Button } from "@/components/superthread/ui/button";
import { Icon, type IconName } from "@/components/superthread/ui/glyphs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/superthread/ui/tooltip";

const tools: readonly { icon: IconName; label: string }[] = [
  { icon: "copy", label: "copy the command" },
  { icon: "search", label: "search the docs" },
  { icon: "plus", label: "new task" },
];

// Icon buttons, each named by a tooltip on hover and keyboard focus and by an aria-label with the same words. The
// tooltip renders at the end of the page, outside its pane, so it takes the mode it is given: each pane passes its
// own.
export function TooltipExample({ mode }: { mode: "light" | "dark" }) {
  return (
    <TooltipProvider>
      <div className="st-pass-tools">
        {tools.map((tool) => (
          <Tooltip key={tool.icon}>
            <TooltipTrigger render={<Button variant="outline" size="icon" aria-label={tool.label} />}>
              <Icon name={tool.icon} />
            </TooltipTrigger>
            <TooltipContent className={mode}>{tool.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <p className="st-pass-hint">point at a button, or tab to it.</p>
    </TooltipProvider>
  );
}
