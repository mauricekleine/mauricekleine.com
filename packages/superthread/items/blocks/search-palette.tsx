import { createContext, useCallback, useContext, useEffect, useId, useState } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/superthread/ui/command";
import { Icon } from "@/components/superthread/ui/glyphs";

type PaletteState = { open: boolean; setOpen: (open: boolean) => void; contentId: string };
const PaletteContext = createContext<PaletteState | null>(null);

function usePalette() {
  const palette = useContext(PaletteContext);
  if (!palette) throw new Error("search palette parts need a search palette");
  return palette;
}

// One search over the app. The modified letter toggles anywhere; slash opens it away from editable text.
function SearchPalette({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  hotkey = "k",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hotkey?: string | null;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const contentId = useId();
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (hotkey === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing) return;
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === hotkey.toLowerCase()
      ) {
        event.preventDefault();
        setOpen(!open);
      } else if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        const target = event.target;
        const field =
          target instanceof Element
            ? target.closest(
                'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="searchbox"], [role="combobox"]',
              )
            : null;
        if (
          field &&
          (!(field instanceof HTMLInputElement) ||
            !["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"].includes(
              field.type,
            ))
        )
          return;
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [hotkey, open, setOpen]);

  return (
    <PaletteContext value={{ open, setOpen, contentId }}>
      <div data-mk="search-palette" data-slot="search-palette" className={cn("contents", className)} {...props} />
    </PaletteContext>
  );
}

// The search box is a button, so focus draws the control ring and its words remain a hint, never a value. It prints no
// keycap.
function SearchPaletteTrigger({
  className,
  placeholder = "search everything",
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> & { placeholder?: string }) {
  const { open, setOpen, contentId } = usePalette();
  return (
    <button
      data-mk="search-palette"
      data-slot="search-palette-trigger"
      type="button"
      aria-label="search"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-2 border border-input bg-background px-3 text-left text-ui text-foreground [@media(max-width:600px)]:h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    >
      <Icon name="search" className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{children ?? placeholder}</span>
    </button>
  );
}

// The command items stay the app's. Render children with select and pass it to each item's onSelect to close and go.
// portalProps reach the dialog's portal, so an app can mount the palette inside a scoped mode.
function SearchPaletteContent({
  className,
  placeholder = "search everything",
  empty = "nothing by that name",
  title = "search",
  description = "search for a page or command",
  onSelect,
  children,
  inputProps,
  portalProps,
  ...props
}: Omit<React.ComponentProps<typeof Command>, "children" | "onSelect"> & {
  placeholder?: string;
  empty?: React.ReactNode;
  title?: string;
  description?: string;
  onSelect?: (value: string) => void;
  children?: React.ReactNode | ((select: (value: string) => void) => React.ReactNode);
  inputProps?: React.ComponentProps<typeof CommandInput>;
  portalProps?: React.ComponentProps<typeof CommandDialog>["portalProps"];
}) {
  const { open, setOpen, contentId } = usePalette();
  const select = (value: string) => {
    setOpen(false);
    onSelect?.(value);
  };
  return (
    <div data-mk="search-palette" data-slot="search-palette-content" className="contents">
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        portalProps={portalProps}
      >
        <Command id={contentId} aria-label={title} className={cn(className)} {...props}>
          <CommandInput aria-label="search" placeholder={placeholder} {...inputProps} />
          <CommandList label="search results" aria-live="polite">
            <CommandEmpty>{empty}</CommandEmpty>
            {typeof children === "function" ? children(select) : children}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export { SearchPalette, SearchPaletteContent, SearchPaletteTrigger };
