import { cn } from "@/components/superthread/lib/utils";

// A placeholder prints the first ink through the 18.75 percent screen (texture-skeleton), still, on whole-pixel bars:
// 12 px tall unless sized, and square.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" data-mk="skeleton" className={cn("h-3 texture-skeleton", className)} {...props} />;
}

export { Skeleton };
