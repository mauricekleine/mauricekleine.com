import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

// Square, 1 px edges, one chromatic ink. The default fills with plum on paper; off-paper turns it into the outline in a
// dark scope, where a plum fill prints pale pink. Key takes the first ink and destructive's hover and press, for an
// action that leaves the app. Hover and press come from the --*-hover and --*-press roles (light overprints key, dark
// lifts the ink). Focus is the base layer's 2 px ring at 2 px offset, so nothing here silences it, and only the fill,
// edge and label travel, so the ring snaps on. A disabled button keeps a flat fill and a plain label, and
// texture-disabled screens its edge back to the half on ::before, which is why every button stays positioned. On a
// phone every size keeps its box and takes the pointer through a 44 px hit area on ::after.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center border border-transparent font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) select-none disabled:pointer-events-none disabled:bg-faint disabled:text-disabled aria-invalid:border-error texture-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [@media(max-width:600px)]:hit-area",
  {
    variants: {
      variant: {
        default:
          "off-paper border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover active:border-primary-press active:bg-primary-press active:shadow-[inset_0_0_0_1px_var(--key)] aria-expanded:border-primary-hover aria-expanded:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-press aria-expanded:bg-secondary-hover",
        outline: "border-current hover:bg-control-hover active:bg-control-press aria-expanded:bg-control-hover",
        ghost: "hover:bg-control-hover active:bg-control-press aria-expanded:bg-control-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-press aria-expanded:bg-destructive-hover",
        key: "bg-first text-background hover:bg-destructive-hover active:bg-destructive-press aria-expanded:bg-destructive-hover",
        link: "text-foreground decoration-1 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2.5 px-4.5 text-ui",
        xs: "h-6 gap-1.5 px-2 text-instrument",
        sm: "h-8 gap-2 px-3 text-instrument",
        lg: "h-12 gap-2.5 px-6 text-ui",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

const iconSizes: ReadonlySet<ButtonSize> = new Set(["icon", "icon-xs", "icon-sm", "icon-lg"]);

// Destructive prints in key with the trash glyph and the word, so red stays a status colour. An icon button shows
// one glyph: the trash, unless it is given its own.
function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const trash = <Icon name="trash" data-icon="inline-start" />;
  let content = children;
  if (variant === "destructive") {
    content =
      size != null && iconSizes.has(size) ? (
        (children ?? trash)
      ) : (
        <>
          {trash}
          {children}
        </>
      );
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      data-mk="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {content}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
