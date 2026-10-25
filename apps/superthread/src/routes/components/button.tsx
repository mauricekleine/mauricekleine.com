import { createFileRoute } from "@tanstack/react-router";
import { ButtonSizes, ButtonStates, ButtonVariants } from "@/examples/button";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/button")({
  staticData: {
    sections: [
      { id: "variants", title: "variants" },
      { id: "states", title: "states" },
      { id: "sizes", title: "sizes" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="button"
        lede="the house ink marks the primary action. destructive prints in key with the trash glyph and its word, so red stays a status colour."
      >
        <InstallLine items={["button"]} />
      </PageHead>

      <Section id="variants" title="variants">
        <p className="st-b-copy">
          six variants on one height and one 1&nbsp;px edge. the names and props are shadcn&apos;s, from base-nova, so
          markup written for shadcn&apos;s button works unchanged.
        </p>
        <ModePair className="st-b-stack">
          <ButtonVariants />
        </ModePair>
      </Section>

      <Section id="states" title="states">
        <p className="st-b-copy">
          in light, hover and press overprint key on the ink. in dark they lift the ink, so plum stays plum when
          pressed. focus is the 2&nbsp;px house ring, 2&nbsp;px outside the button.
        </p>
        <p className="st-b-copy">a disabled button keeps a flat fill and a plain label, and its edge prints at half.</p>
        <ModePair className="st-b-stack" light={<ButtonStates mode="light" />} dark={<ButtonStates mode="dark" />} />
        <Caption detail="disabled" />
      </Section>

      <Section id="sizes" title="sizes">
        <p className="st-b-copy">
          four heights for a word, four squares for a glyph alone. a button with only a glyph needs an{" "}
          <code>aria-label</code>.
        </p>
        <ModePair className="st-b-stack">
          <ButtonSizes />
        </ModePair>
      </Section>
    </>
  );
}
