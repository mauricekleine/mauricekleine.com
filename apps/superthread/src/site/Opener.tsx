import type { ReactNode } from "react";
import { CropMarks } from "./CropMarks";
import { Plate } from "./Plate";

// The overview's head: the opener plate inside its crop marks, with the wordmark knocked out of its lower left, then
// the lede and whatever follows it. The plate is the master's composite for the active mode, so one file loads; at
// 600 px and below the phone plate takes over. A narrower column crops the plate and never scales it, and the
// wordmark steps down with the band's own width (overview.css), so it never runs past the band. Like PageHead, it is
// the page's "top" in the aside.
export function Opener({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header id="top" className="st-opener">
      <div className="st-opener-band">
        <Plate
          name="opener"
          phone="opener-phone"
          width={696}
          height={196}
          label="a two-ply cord, screened in two inks"
        />
        <CropMarks />
        <div className="st-opener-knock">
          <h1>{title}</h1>
        </div>
      </div>
      {lede && <p className="st-opener-lede type-lede">{lede}</p>}
      {children}
    </header>
  );
}
