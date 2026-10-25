import type { ReactNode } from "react";
import { CropMarks } from "./CropMarks";
import { Plate } from "./Plate";

// An inner page's head: the slim band whole inside its crop marks (one screened field), the page title set under
// it, then an optional lede. No box cuts the band, so the rope never breaks off under a long title. The overview's
// opener takes its place on /. The head is the page's "top" in the aside's list.
export function PageHead({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header id="top" className="st-pagehead">
      <div className="st-band">
        <Plate name="band" phone="band-phone" width={696} height={160} phoneWidth={342} phoneHeight={136} />
        <CropMarks />
      </div>
      <h1 className="st-pagehead-title type-hero">{title}</h1>
      {lede && <p className="st-lede type-lede">{lede}</p>}
      {children}
    </header>
  );
}
