import type { ReactNode } from "react";

// Specimen pages open with their title, lede and install line. The aside links here as "top".
export function PageHead({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header id="top" className="st-pagehead">
      <h1 className="st-pagehead-title type-hero text-first">{title}</h1>
      {lede && <p className="st-lede type-lede">{lede}</p>}
      {children}
    </header>
  );
}
