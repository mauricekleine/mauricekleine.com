import type { ReactNode } from "react";
import { CropMarks } from "./CropMarks";
import { Plate } from "./Plate";

// An inner page's head: the slim band (one screened field, inside crop marks) with the page title knocked out of
// its lower left, then an optional lede. The overview's opener takes its place on /. The head is the page's "top"
// in the aside's list.
export function PageHead({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header id="top" className="st-pagehead">
      <div className="st-band">
        <Plate name="band" phone="band-phone" width={696} height={120} />
        <CropMarks />
        <div className="st-knock">
          <h1 className="type-hero">{title}</h1>
        </div>
      </div>
      {lede && <p className="st-lede type-lede">{lede}</p>}
      {children}
    </header>
  );
}
