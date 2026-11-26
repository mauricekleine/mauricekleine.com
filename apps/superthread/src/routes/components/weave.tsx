import { createFileRoute } from "@tanstack/react-router";
import { Weave } from "@/components/superthread/ui/weave";
import { CropMarks } from "@/site/CropMarks";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/weave")({
  staticData: {
    sections: [
      { id: "ramps", title: "Four ramps" },
      { id: "spec", title: "Spec line" },
    ],
  },
  component: WeavePage,
});

const hero =
  "run=down fray=arch apex=.24 sides=.45 wobble=2 period=60 ramp=fade thread=2.4 knot=.36 knotr=19.5 live seed=3";

const ramps = [
  { name: "held", label: "Held", use: "Findings, beliefs, facts", shape: "fray=.06 bow=6", seed: 11 },
  { name: "steady", label: "Steady", use: "Principles, plans, how-to", shape: "fray=.06 waves=2 amp=3", seed: 23 },
  { name: "bet", label: "Bet", use: "Hypotheses, proposals, questions", shape: "fray=.04 bow=-4", seed: 37 },
  { name: "fade", label: "Fade", use: "Notes, appendix, heads", shape: "fray=.06 waves=1 amp=4", seed: 51 },
];

function WeavePage() {
  return (
    <>
      <header id="top" className="st-pagehead">
        <h1 className="st-pagehead-title type-hero text-first">Weave</h1>
        <p className="st-lede type-lede">
          A solid breaks into a screen, with a plum thread along the break. New document openers and chapter breaks use{" "}
          <a href="/components/plate">Plate</a> instead.
        </p>
        <InstallLine items={["weave"]} />
        <div className="relative mt-12">
          <Weave spec={hero} className="h-40 sm:h-60" />
          <CropMarks />
        </div>
      </header>
      <Section id="ramps" title="Four ramps">
        <p className="st-pass-prose">Choose by how settled the words are. The same ramp prints in both modes.</p>
        <div className="mt-8 space-y-12">
          {ramps.map(({ name, label, use, shape, seed }) => (
            <figure key={name}>
              <figcaption className="mb-4 flex flex-wrap items-baseline gap-x-4">
                <strong className="type-subtitle">{label}</strong>
                <span className="type-summary text-muted-foreground">{use}</span>
              </figcaption>
              <ModePair>
                <div className="relative m-4">
                  <Weave
                    className="h-24"
                    spec={`run=right phone=down ${shape} wobble=1 ramp=${name} thread=4.5 seed=${seed}`}
                  />
                  <CropMarks />
                </div>
              </ModePair>
            </figure>
          ))}
        </div>
      </Section>
      <Section id="spec" title="Spec line">
        <p className="st-pass-prose">
          Set the field&rsquo;s size in CSS. Pass the line as <code>spec</code> in React or <code>data-weave</code> in
          HTML. Import <code>mountWeave</code> from <code>lib/weave-core</code> on a plain page.
        </p>
        <pre className="my-4 whitespace-pre-wrap break-words border border-border p-4 font-mono text-xs leading-5">
          {hero}
        </pre>
        <p className="type-summary text-muted-foreground">
          The knot moves in the hero. Reduced motion and print hold its still frame.
        </p>
      </Section>
    </>
  );
}
