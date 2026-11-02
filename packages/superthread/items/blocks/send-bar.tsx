import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Button, buttonVariants } from "@/components/superthread/ui/button";
import { Paper } from "@/components/superthread/ui/paper";

// The foot of a review: who the writing goes to, every address and file, and the one way out. It prints on paper as a
// key block, so the ring takes the first ink. The ring sits on a child of the paper, because the .light island resets
// --ring on its own element. The bar sizes itself against its own width, so it fits a panel, a letter or a page; the
// facts fold before the columns stack, and on a phone paper's own padding takes over.
function SendBar({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <Paper render={<section {...props} />} className={cn("@container/send-bar py-5", className)}>
      <div
        data-mk="send-bar"
        data-slot="send-bar"
        className="grid grid-cols-[minmax(0,1fr)_304px] items-start gap-x-8 [--ring:var(--first)] @max-[592px]/send-bar:grid-cols-[minmax(0,1fr)] @max-[592px]/send-bar:gap-y-4"
      >
        {children}
      </div>
    </Paper>
  );
}

// The left column: the title, then an address or the facts.
function SendBarTo({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="send-bar-to" className={cn("min-w-0", className)} {...props} />;
}

// Where the writing goes, or where it went. It announces itself when a send changes it.
function SendBarTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="send-bar-title"
      aria-live="polite"
      className={cn("min-w-0 type-title text-first text-pretty", className)}
      {...props}
    />
  );
}

// The one address under the title, for a bar with a single recipient. A long one wraps, so the bar holds its width.
function SendBarAddress({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="send-bar-address"
      className={cn("mt-1 min-w-0 type-instrument font-mono text-muted-foreground [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

// The recipients and files: a label column, then names and addresses that share their columns across rows. When the bar
// narrows, the address drops under its name.
function SendBarFacts({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="send-bar-facts"
      className={cn(
        "mt-3 grid min-w-0 grid-cols-[64px_minmax(0,max-content)_minmax(0,1fr)] gap-x-2 gap-y-0.5 type-ui text-foreground @max-[732px]/send-bar:grid-cols-[64px_minmax(0,1fr)]",
        className,
      )}
      {...props}
    />
  );
}

// A muted word in the label column, on the fact's line height so the two share a baseline.
function SendBarLabel({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="send-bar-label"
      className={cn("text-instrument leading-(--text-ui--line-height) text-muted-foreground", className)}
      {...props}
    />
  );
}

// One recipient. Several facts under one label stack, as a cc does.
function SendBarFact({
  className,
  address,
  children,
  ...props
}: React.ComponentProps<"dd"> & { address?: React.ReactNode }) {
  return (
    <dd
      data-slot="send-bar-fact"
      className={cn(
        "col-[2/-1] grid min-w-0 grid-cols-subgrid items-baseline [overflow-wrap:anywhere] [&>:only-child]:col-span-full @max-[732px]/send-bar:col-[2] @max-[732px]/send-bar:block",
        className,
      )}
      {...props}
    >
      <span className="min-w-0">{children}</span>
      {address != null && (
        <span className="min-w-0 font-mono text-instrument leading-(--text-ui--line-height) text-muted-foreground @max-[732px]/send-bar:block">
          {address}
        </span>
      )}
    </dd>
  );
}

// One attached file, whole, in the mono face that holds a name of any length.
function SendBarFile({ className, ...props }: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="send-bar-file"
      className={cn(
        "col-[2/-1] min-w-0 font-mono text-instrument leading-(--text-ui--line-height) [overflow-wrap:anywhere] @max-[732px]/send-bar:col-[2]",
        className,
      )}
      {...props}
    />
  );
}

// The right column: the way out and the note under it. The key action takes the room a second action leaves.
function SendBarActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="send-bar-actions" className={cn("flex min-w-0 flex-wrap gap-2", className)} {...props} />;
}

// A long word wraps inside the box, so the button never leaves the column.
const fills = "h-auto min-h-12 py-2.5 whitespace-normal";

// The send, in key, and a second action in outline beside it. Enter never fires it, so a key held from the last field
// can't send, and Space is the keyboard path. Sent, it stays where it was at the same width and reads as a receipt: no
// fill, its word in foreground, its edge at half.
function SendBarButton({
  className,
  variant = "key",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "ignoreEnter" | "nativeButton" | "render" | "size" | "variant"> & {
  variant?: "key" | "outline";
}) {
  return (
    <Button
      data-slot="send-bar-button"
      variant={variant}
      size="lg"
      ignoreEnter
      className={cn(
        fills,
        "disabled:bg-transparent disabled:text-foreground",
        variant === "key" ? "flex-1" : "flex-none",
        className,
      )}
      {...props}
    />
  );
}

// A handoff in key: the send happens somewhere else, so this is a link, Enter included. Takes an href or the app's router
// link through render.
function SendBarLink({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    render,
    state: { slot: "send-bar-link" },
    props: mergeProps<"a">(
      { href, className: cn(buttonVariants({ variant: "key", size: "lg" }), fills, "flex-1", className) },
      props,
    ),
  });
}

// One muted line under the action: why it works this way, or what to check first.
function SendBarNote({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="send-bar-note"
      className={cn("min-w-0 basis-full type-instrument text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  SendBar,
  SendBarTo,
  SendBarTitle,
  SendBarAddress,
  SendBarFacts,
  SendBarLabel,
  SendBarFact,
  SendBarFile,
  SendBarActions,
  SendBarButton,
  SendBarLink,
  SendBarNote,
};
