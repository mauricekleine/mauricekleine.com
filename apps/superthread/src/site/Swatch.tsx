import { cn } from "@/components/superthread/lib/utils";

// One colour chip with its name and value: a square of the colour inside a 1 px border, so white and the ground
// both read on either stock.
export function Swatch({
  color,
  name,
  value,
  className,
}: {
  // any CSS colour, a token as var(--primary) included
  color: string;
  name?: string;
  value?: string;
  className?: string;
}) {
  return (
    <figure className={cn("st-swatch", className)}>
      <i style={{ background: color }} aria-hidden="true" />
      {(name || value) && (
        <figcaption>
          {name && <b>{name}</b>}
          {value && <span>{value}</span>}
        </figcaption>
      )}
    </figure>
  );
}
