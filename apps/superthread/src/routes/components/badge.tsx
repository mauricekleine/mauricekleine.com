import { createFileRoute } from "@tanstack/react-router";
import { BadgeLong, BadgeSizes, BadgeStates, BadgeVariants, BadgeWords } from "@/examples/badge";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/badge")({
  staticData: {
    sections: [
      { id: "status", title: "Status" },
      { id: "variants", title: "Variants" },
      { id: "sizes", title: "Sizes" },
      { id: "long", title: "Long words" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Badge"
        lede="A word in a 30&nbsp;px box with a 1&nbsp;px edge. A status badge adds its glyph square, so the state reads without its colour."
      >
        <InstallLine items={["badge"]} />
      </PageHead>

      <Section id="status" title="Status">
        <p className="st-b-copy">
          Five states, each a wash fill, a soft edge, a full-strength glyph square and the word. Failed is the only
          solid badge, so the urgent state stands out by its form.
        </p>
        <p className="st-b-copy">
          Give a status badge a word and it takes the place of the state&apos;s name. The glyph stays.
        </p>
        <ModePair className="st-b-stack">
          <BadgeStates />
          <BadgeWords />
        </ModePair>
      </Section>

      <Section id="variants" title="Variants">
        <p className="st-b-copy">Shadcn&apos;s six variants, square, with the word at 13&nbsp;px.</p>
        <ModePair className="st-b-stack">
          <BadgeVariants />
        </ModePair>
      </Section>

      <Section id="sizes" title="Sizes">
        <p className="st-b-copy">
          <code>sm</code> is 24&nbsp;px, the height of an <code>xs</code> button. It fits a status into a row&apos;s
          aside without pushing the row taller.
        </p>
        <ModePair className="st-b-stack">
          <BadgeSizes />
        </ModePair>
      </Section>

      <Section id="long" title="Long words">
        <p className="st-b-copy">
          A long badge wraps inside its parent and grows downward, so it never runs a phone page past its edge. A table
          cell keeps it on one line and scrolls instead.
        </p>
        <ModePair className="st-b-stack">
          <BadgeLong />
        </ModePair>
      </Section>
    </>
  );
}
