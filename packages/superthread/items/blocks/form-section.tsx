import { createContext, useContext, useId } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { FieldGroup } from "@/components/superthread/ui/field";

const FormSectionContext = createContext<string | undefined>(undefined);

// A named form with room for its fields and a ruled save row. The app owns validation, saving and discarding.
// It owns its title's id, so the form keeps its name; pass titleId when the app needs a known id.
function FormSection({
  className,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"form"> & { titleId?: string }) {
  const id = useId();
  const titleId = suppliedTitleId ?? `${id}-title`;
  return (
    <FormSectionContext.Provider value={titleId}>
      <form
        data-mk="form-section"
        data-slot="form-section"
        aria-labelledby={titleId}
        className={cn("grid min-w-0 gap-6", className)}
        {...props}
      />
    </FormSectionContext.Provider>
  );
}

// The title and its explanation stay together above the fields.
function FormSectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="form-section-header" className={cn("grid min-w-0 gap-2", className)} {...props} />;
}

// The form's heading supplies its accessible name without a separate label.
function FormSectionTitle({ className, ...props }: Omit<React.ComponentProps<"h2">, "id">) {
  const titleId = useContext(FormSectionContext);
  return (
    <h2
      data-slot="form-section-title"
      className={cn("type-title text-balance text-first", className)}
      {...props}
      id={titleId}
    />
  );
}

// A short explanation of what the fields change, on the summary step.
function FormSectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-section-description"
      className={cn("type-summary text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

// Fields keep the item's own spacing and can be rearranged by the app.
function FormSectionFields({ className, ...props }: React.ComponentProps<typeof FieldGroup>) {
  return <FieldGroup data-slot="form-section-fields" className={cn("min-w-0", className)} {...props} />;
}

// A quiet rule separates the save controls, which wrap and align at the end.
function FormSectionFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-section-footer"
      className={cn("flex flex-wrap items-center justify-end gap-2 border-t border-border pt-6", className)}
      {...props}
    />
  );
}

// The app says whether the form changed or saved; updates are read out beside the actions.
function FormSectionStatus({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-section-status"
      aria-live="polite"
      className={cn("mr-auto type-instrument text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
};
