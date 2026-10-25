import { cn } from "@/components/superthread/lib/utils";
import * as ResizablePrimitive from "react-resizable-panels";

// The group keeps full-size panels side by side, or stacked when its orientation is vertical.
function ResizablePanelGroup({ className, orientation = "horizontal", ...props }: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      data-mk="resizable"
      orientation={orientation}
      className={cn("flex h-full w-full", orientation === "vertical" && "flex-col", className)}
      {...props}
    />
  );
}

// Panel sizing and its imperative API stay with react-resizable-panels.
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

// A 1 px rule has an 8 px hit area. v4 marks hover and drag with data-separator=hover and active. With a grip, its
// box draws the inside ring; without one, a zero-offset ring straddles the rule so keyboard focus stays visible.
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group/resizable-handle relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 data-[separator=hover]:bg-primary data-[separator=active]:bg-primary focus-visible:bg-primary aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:inset-y-auto aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        withHandle
          ? "focus-visible:outline-0"
          : "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--ring)",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="relative z-10 flex h-4 w-1.5 shrink-0 items-center justify-center gap-0.5 border border-input bg-background group-focus-visible/resizable-handle:outline-2 group-focus-visible/resizable-handle:-outline-offset-2 group-focus-visible/resizable-handle:outline-(--ring)">
          <div className="h-2 w-px bg-input" />
          <div className="h-2 w-px bg-input" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
