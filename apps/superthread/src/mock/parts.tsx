import type { CSSProperties } from "react";
import { CropMarks } from "@/site/CropMarks";
import { Plate } from "@/site/Plate";

// A ship's mark at its own pixel size: the light file on a light page, the dark file on a dark one. The dark scope
// switches them in mock.css, so the prerendered page never shows the wrong one.
export function ShipMark({ ship, size = 32 }: { ship: string; size?: 16 | 32 }) {
  return (
    <span className="mock-mark" style={{ width: size, height: size }}>
      <img src={`/marks/${ship}/${ship}.svg`} alt="" width={size} height={size} className="mock-mark-light" />
      <img src={`/marks/${ship}/${ship}-dark.svg`} alt="" width={size} height={size} className="mock-mark-dark" />
    </span>
  );
}

// A screened plate inside its crop marks, the way the docs print one. `phone` names the plate for 600 px and below;
// the field takes the width of the plate it shows, so the marks sit on the plate's corners.
export function PlateField({
  name,
  phone,
  width,
  phoneWidth = width,
  height,
  label,
}: {
  name: string;
  phone?: string;
  width: number;
  phoneWidth?: number;
  height: number;
  label?: string;
}) {
  const style = { "--field-w": `${width}px`, "--field-phone-w": `${phoneWidth}px` } as CSSProperties;
  return (
    <div className="mock-field" style={style}>
      <Plate name={name} phone={phone} width={width} height={height} label={label} />
      <CropMarks />
    </div>
  );
}
