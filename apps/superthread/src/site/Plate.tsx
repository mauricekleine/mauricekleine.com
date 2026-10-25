import type { CSSProperties } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { plates } from "./texture.gen";

type Modes<T> = { readonly light: T; readonly dark: T };

// texture.gen.ts's two forms: a composite is one indexed image per mode; masks are a first and a spot plate per
// mode, which CSS inks with the first ink and the house ink
export type PlateEntry =
  | { readonly form: "composite"; readonly w: number; readonly h: number; readonly url: Modes<string> }
  | {
      readonly form: "masks";
      readonly w: number;
      readonly h: number;
      readonly url: Modes<{ readonly first: string; readonly spot: string }>;
    };

const table: Readonly<Record<string, PlateEntry | undefined>> = plates;

export function plate(name: string): PlateEntry | undefined {
  return table[name];
}

const url = (path: string) => `url("${path}")`;

// the custom properties one plate sets, under a prefix so a phone plate can sit beside the wide one
function vars(prefix: string, entry: PlateEntry): Record<string, string> {
  const out: Record<string, string> = { [`--${prefix}-w`]: `${entry.w}px`, [`--${prefix}-h`]: `${entry.h}px` };
  if (entry.form === "composite") {
    out[`--${prefix}-light`] = url(entry.url.light);
    out[`--${prefix}-dark`] = url(entry.url.dark);
  } else {
    out[`--${prefix}-light-first`] = url(entry.url.light.first);
    out[`--${prefix}-light-spot`] = url(entry.url.light.spot);
    out[`--${prefix}-dark-first`] = url(entry.url.dark.first);
    out[`--${prefix}-dark-spot`] = url(entry.url.dark.spot);
  }
  return out;
}

// A screened plate from texture.gen.ts, printed at its own pixel size so it stays crisp at 1x and 2x: a composite
// shows the active mode's image only (one file loads), masks print the mode's two plates, the house ink first and
// the first ink over it, as the master prints them, so the key cores read on top. A narrower box crops the plate
// rather than scaling it. `phone` names the plate that takes over at 600 px and below. A plate not generated yet
// prints as a flat field of the given size (phoneWidth and phoneHeight at 600 px and below).
export function Plate({
  name,
  phone,
  width,
  height,
  phoneWidth,
  phoneHeight,
  className,
  label,
}: {
  name: string;
  phone?: string;
  width?: number;
  height?: number;
  phoneWidth?: number;
  phoneHeight?: number;
  className?: string;
  // the plate's alt text; without one the plate is decorative
  label?: string;
}) {
  const wide = plate(name);
  const narrow = phone === undefined ? undefined : plate(phone);
  const form = wide?.form ?? "missing";
  const flatPhone = phone !== undefined && !narrow && (phoneWidth !== undefined || phoneHeight !== undefined);
  const style = {
    ...(wide ? vars("plate", wide) : { "--plate-w": `${width ?? 0}px`, "--plate-h": `${height ?? 0}px` }),
    ...(narrow ? vars("plate-phone", narrow) : {}),
    ...(flatPhone
      ? { "--plate-phone-w": `${phoneWidth ?? width ?? 0}px`, "--plate-phone-h": `${phoneHeight ?? height ?? 0}px` }
      : {}),
  } as CSSProperties;
  return (
    <div
      className={cn("st-plate", className)}
      data-form={form}
      data-phone={narrow ? narrow.form : flatPhone ? "missing" : undefined}
      data-plate={name}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {form === "masks" && (
        <>
          <i className="st-plate-spot" />
          <i className="st-plate-first" />
        </>
      )}
    </div>
  );
}
