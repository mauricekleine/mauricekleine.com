import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { BreathStrength } from "@/components/superthread/lib/plate-core";
import { Button } from "@/components/superthread/ui/button";
import { Plate } from "@/components/superthread/ui/plate";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/plate")({
  staticData: {
    sections: [
      { id: "breath", title: "light breath" },
      { id: "geometry", title: "no-photo grids and planes" },
      { id: "use", title: "use" },
    ],
  },
  component: PlatePage,
});

const strengths: readonly BreathStrength[] = ["gentle", "balanced", "vivid", "off"];

const studies = [
  {
    id: "planes",
    title: "proportional planes",
    note: "column widths reflect the document's own ratios or layers.",
    spec: "planes ratios=42,24,18,16 seed=7",
  },
  {
    id: "grid",
    title: "architectural grid",
    note: "cell tones carry coverage, counts or inventory density.",
    spec: "grid cols=6 rows=4 seed=19",
  },
] as const;

function PlatePage() {
  const [breath, setBreath] = useState<BreathStrength>("vivid");

  return (
    <>
      <header id="top" className="st-pagehead">
        <h1 className="st-pagehead-title type-hero text-first">plate</h1>
        <p className="st-lede type-lede">
          a framed 3.5 px two-ink proof halftone (key 45° and plum 15°) with a calm light breath for document openers,
          chapter breaks and figures.
        </p>
        <InstallLine items={["plate"]} />
      </header>

      <Section id="breath" title="light breath">
        <p className="st-pass-prose">
          in light mode the drifting light opens dark halftone dots toward paper and warms the 15° plum plate. in dark
          mode white dots rest calmly on key stock and brighten as light passes across. reduced motion and print hold
          frame zero.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {strengths.map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={breath === level ? "secondary" : "outline"}
              aria-pressed={breath === level}
              onClick={() => setBreath(level)}
            >
              {level}
            </Button>
          ))}
        </div>
        <div className="mt-6">
          <ModePair>
            <Plate spec="planes ratios=42,24,18,16 seed=7" breath={breath} className="h-44 w-full" aria-hidden="true" />
          </ModePair>
        </div>
      </Section>

      <Section id="geometry" title="no-photo grids and planes">
        <p className="st-pass-prose">
          pass any photograph or illustration through <code>src</code> or a child <code>img</code>. when a technical
          document has no photography, derive a blocky grid or set of proportional planes from the subject rather than
          reusing a canned pattern.
        </p>
        <div className="mt-8 space-y-12">
          {studies.map(({ id, title, note, spec }) => (
            <figure key={id}>
              <figcaption className="mb-4 space-y-1">
                <h3 className="type-subtitle">{title}</h3>
                <p className="type-summary text-muted-foreground">{note}</p>
              </figcaption>
              <ModePair>
                <Plate spec={spec} breath={breath} className="h-36 w-full" aria-hidden="true" />
              </ModePair>
              <pre className="mt-3 whitespace-pre-wrap break-words border border-border p-3 font-mono text-xs leading-5">
                {spec}
              </pre>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="use" title="use">
        <p className="st-pass-prose">
          import <code>Plate</code> from <code>ui/plate</code>. size the host in css and pass <code>src</code> for an
          image, <code>draw</code> for custom canvas geometry, or <code>spec</code> for grids and planes.
        </p>
        <p className="mt-4 st-pass-prose">
          in plain html, give a sized host <code>data-plate</code> or <code>data-plate-src</code> and inline{" "}
          <code>doc/plate.js</code> from <code>@mk/doc</code> after the sections.
        </p>
      </Section>
    </>
  );
}
