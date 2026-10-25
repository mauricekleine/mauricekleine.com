import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/superthread/ui/button";
import { Icon, type IconName } from "@/components/superthread/ui/glyphs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/superthread/ui/tooltip";

const tools: readonly { icon: IconName; label: string }[] = [
  { icon: "copy", label: "copy the command" },
  { icon: "search", label: "search the docs" },
  { icon: "plus", label: "new task" },
];

// the button the printed tooltip names
const named: IconName = "search";

// The tooltip as it stands open over one of the buttons, printed inside a frame with room above them. The frame is
// positioned and clips (contain: layout paint), so the tooltip sits in it, under the page's sticky masthead.
// TooltipContent portals to the body on its own and lands in the nearest outer portal when there is one, but Base
// UI's tooltip portal is the light kind that hands no container on. So a dialog root, open with nothing in it but
// its portal, is the outer portal here: it hands the tooltip the frame, which comes from state, so the portal waits
// for it. Inert: nothing in the print takes focus or the pointer, and it stays open.
export function TooltipPrinted() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="st-pass-tipframe" inert>
      <div className="st-pass-tools">
        {tools.map((tool) =>
          tool.icon === named ? (
            <Tooltip key={tool.icon} open>
              <TooltipTrigger render={<Button variant="outline" size="icon" aria-label={tool.label} />}>
                <Icon name={tool.icon} />
              </TooltipTrigger>
              <DialogPrimitive.Root open modal={false}>
                <DialogPrimitive.Portal container={frame}>
                  <TooltipContent>{tool.label}</TooltipContent>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>
            </Tooltip>
          ) : (
            <Button key={tool.icon} variant="outline" size="icon" aria-label={tool.label}>
              <Icon name={tool.icon} />
            </Button>
          ),
        )}
      </div>
    </div>
  );
}

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
