import { createFileRoute } from "@tanstack/react-router";
import { BadgeStates, BadgeVariants, BadgeWords } from "@/examples/badge";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/badge")({
  staticData: {
    sections: [
      { id: "status", title: "status" },
      { id: "variants", title: "variants" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="badge"
        lede="a word in a 30&nbsp;px box with a 1&nbsp;px edge. a status badge adds its glyph square, so the state reads without its colour."
      >
        <InstallLine items={["badge"]} />
      </PageHead>

      <Section id="status" title="status">
        <p className="st-b-copy">
          five states, each a wash fill, a soft edge, a full-strength glyph square and the word. failed is the only
          solid badge, so the urgent state stands out by its form.
        </p>
        <p className="st-b-copy">
          give a status badge a word and it takes the place of the state&apos;s name. the glyph stays.
        </p>
        <ModePair className="st-b-stack">
          <BadgeStates />
          <BadgeWords />
        </ModePair>
      </Section>

      <Section id="variants" title="variants">
        <p className="st-b-copy">shadcn&apos;s six variants, square, with the word at 13&nbsp;px.</p>
        <ModePair className="st-b-stack">
          <BadgeVariants />
        </ModePair>
      </Section>
    </>
  );
}
