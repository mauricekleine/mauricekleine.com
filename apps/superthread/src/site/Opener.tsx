import { useEffect, useState, type CSSProperties } from "react";
import { FieldArt } from "@/components/superthread/ui/field-art";
import { breakpoints } from "./layout";
import { span, spanPlate, type OpenerKind, type SpanCrop } from "./span";

function LiveSpan() {
  const [crop, setCrop] = useState<SpanCrop>();
  useEffect(() => {
    const phone = matchMedia(`(max-width: ${breakpoints.phone}px)`);
    const update = () => setCrop(phone.matches ? "phone" : "desktop");
    update();
    phone.addEventListener("change", update);
    return () => phone.removeEventListener("change", update);
  }, []);
  if (!crop) return null;
  const { line, mask } = span[crop];
  return <FieldArt spec={line} mask={mask} playing style={{ position: "absolute", inset: 0 }} />;
}

// The plate and the canvas share a band. It prints frame zero as soon as the page's CSS loads.
export function Opener({ kind, title, lede }: { kind: OpenerKind; title: string; lede: string }) {
  const plate = (crop: SpanCrop, mode: "light" | "dark") =>
    `image-set(url("${spanPlate(kind, crop, mode, 1)}") 1x, url("${spanPlate(kind, crop, mode, 2)}") 2x)`;
  const plates = {
    "--st-span-light": plate("desktop", "light"),
    "--st-span-dark": plate("desktop", "dark"),
    "--st-span-phone-light": plate("phone", "light"),
    "--st-span-phone-dark": plate("phone", "dark"),
  } as CSSProperties;

  return (
    <header id="top" className="st-opener st-island dark">
      <div className="st-opener-copy">
        <h1>{title}</h1>
        <p className="type-lede">{lede}</p>
      </div>
      <div className="st-opener-field" style={plates} aria-hidden="true">
        <div className="st-opener-plate" />
        {kind === "home" && <LiveSpan />}
      </div>
    </header>
  );
}
