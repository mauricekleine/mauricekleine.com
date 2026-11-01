import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";

// The box is the field. While its text control holds focus, the box's 1 px edge becomes 2 px inside it, in --fx
// (the ring's ink, or the error ink when the control is invalid); the control itself draws no outline and its caret
// takes --fx. The rule matches the text control with :has(), never :focus-within, because a button inside the box
// (clear, reveal, a toggle) is a control: it takes its own 2 px ring inside itself and the box stays at 1 px.
// Disabled is the text control's state: the box never takes focus, keeps a flat fill and the disabled label, and its
// edge is screened back. A disabled button inside the box is the button's own state and leaves the box as it is.
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      data-mk="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-10 w-full min-w-0 items-center [@media(max-width:600px)]:h-11 border border-input bg-background text-ui text-foreground [--fx:var(--ring)] has-[input:focus,textarea:focus]:border-(--fx) has-[input:focus,textarea:focus]:outline-2 has-[input:focus,textarea:focus]:-outline-offset-2 has-[input:focus,textarea:focus]:outline-(--fx) has-[[aria-invalid=true]]:border-error has-[[aria-invalid=true]]:[--fx:var(--error)] has-[input:disabled,textarea:disabled]:cursor-not-allowed has-[input:disabled,textarea:disabled]:bg-faint has-[input:disabled,textarea:disabled]:text-disabled texture-disabled has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-2.5 has-[>[data-align=inline-start]]:[&>input]:pl-2.5",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2.5 py-1.5 text-ui font-medium text-muted-foreground select-none group-has-[input:disabled,textarea:disabled]/input-group:cursor-not-allowed group-has-[input:disabled,textarea:disabled]/input-group:text-disabled",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:-ml-1.5 has-[>kbd]:-ml-0.5",
        "inline-end": "order-last pr-3 has-[>button]:-mr-1.5 has-[>kbd]:-mr-0.5",
        "block-start":
          "order-first w-full justify-start px-3 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end": "order-last w-full justify-start px-3 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

// A control inside the field: its focus ring is drawn inside itself, so the box keeps its 1 px edge.
const inputGroupButtonVariants = cva(
  "flex items-center gap-1.5 text-ui shadow-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
  {
    variants: {
      size: {
        xs: "h-7 px-2",
        sm: "h-8 px-2.5",
        "icon-xs": "size-7 p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("flex items-center gap-2.5 text-ui text-muted-foreground [&_svg]:pointer-events-none", className)}
      {...props}
    />
  );
}

// The text controls inside the box carry no box of their own: no edge, fill, shadow or outline. The box draws focus.
function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      data-slot="input-group-control"
      className={cn(
        "min-w-0 flex-1 self-stretch border-0 bg-transparent px-3 text-ui shadow-none outline-0 caret-(--fx) placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "field-sizing-content min-h-[78px] w-full flex-1 resize-none border-0 bg-transparent px-3 py-[9px] text-ui leading-5 shadow-none outline-0 caret-(--fx) placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea };
