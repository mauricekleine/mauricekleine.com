import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

import { FieldErrorGlyph } from "@/components/superthread/ui/glyphs";
import { Separator } from "@/components/superthread/ui/separator";

// A fieldset keeps related controls together without adding a frame.
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

// Legends set in mono caps; the label variant uses the interface weight.
function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        variant === "legend" ? "mb-1.5 type-meta text-muted-foreground" : "mb-1.5 text-ui font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// Groups keep the container that responsive field rows measure against.
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px [@media(max-width:600px)]:has-[>[role=checkbox],>[role=radio],>[role=switch]]:min-h-11 [@media(max-width:600px)]:has-[>[role=checkbox],>[role=radio],>[role=switch]]:*:data-[slot=field-label]:self-stretch",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

// A field keeps its upstream orientation and scopes label states to its controls. On a phone a row holding a tick is
// 44 px tall with the label filling it, so stacked choices never share a target.
function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-mk="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

// The content column keeps a label and its supporting text together.
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", className)}
      {...props}
    />
  );
}

// A label stays plain; a choice card edges its checked field in foreground. On a phone a label holding a tick is a 44 px
// row, so stacked choices never share a target.
function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit items-center gap-2 text-ui font-medium select-none [@media(max-width:600px)]:has-[>[role=checkbox],>[role=radio],>[role=switch]]:min-h-11 group-data-[invalid=true]/field:text-error group-data-[disabled=true]/field:text-disabled has-[>[data-slot=field]]:border has-[>[data-slot=field]]:border-border has-[>[data-slot=field]]:p-4 has-[>[data-slot=field]]:has-data-checked:border-foreground has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:not-has-data-checked:hover:bg-control-hover",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

// A non-label title carries the same weight and field states as a label.
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-ui font-medium group-data-[invalid=true]/field:text-error group-data-[disabled=true]/field:text-disabled",
        className,
      )}
      {...props}
    />
  );
}

// Supporting text sets at the instrument step, and its links hold the underline at rest in foreground.
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left type-instrument text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

// A quiet rule runs behind an instrument label on the stock.
function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 h-5 group-data-[variant=outline]/field-group:-mb-2", className)}
      {...props}
    >
      <Separator className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 type-instrument text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

// Every error leads with the bang square; duplicate and empty messages take no room.
function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return (
        <div className="flex items-start gap-2">
          <FieldErrorGlyph className="mt-[3px] shrink-0" />
          <div>{children}</div>
        </div>
      );
    }

    const messages = [
      ...new Set(errors?.map((error) => error?.message).filter((message): message is string => !!message)),
    ];
    if (!messages.length) return null;

    if (messages.length === 1) {
      return (
        <div className="flex items-start gap-2">
          <FieldErrorGlyph className="mt-[3px] shrink-0" />
          <div>{messages[0]}</div>
        </div>
      );
    }

    return (
      <ul className="flex list-none flex-col gap-1">
        {messages.map((message) => (
          <li key={message} className="flex items-start gap-2">
            <FieldErrorGlyph className="mt-[3px] shrink-0" />
            <div>{message}</div>
          </li>
        ))}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div role="alert" data-slot="field-error" className={cn("type-instrument text-error", className)} {...props}>
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
