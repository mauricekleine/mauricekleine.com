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
        lede="plum marks the primary action on paper, and off paper it prints as an outline. destructive prints in key with the trash glyph and its word, so red stays a status colour."
      >
        <InstallLine items={["button"]} />
      </PageHead>

      <Section id="variants" title="variants">
        <p className="st-b-copy">
          seven variants on one height and one 1&nbsp;px edge. the names and props are shadcn&apos;s, from base-nova, so
          markup written for shadcn&apos;s button works unchanged. key is the one we added: the first ink with a stock
          label, for a strong action where plum isn&apos;t the fill.
        </p>
        <p className="st-b-copy">
          off paper, in a dark scope, a plum fill prints pale pink, so the default prints as the outline. that&apos;s
          every surface of a dark page and the frame on any page. on a light page a panel is paper, so the default
          fills.
        </p>
        <ModePair className="st-b-stack">
          <ButtonVariants />
        </ModePair>
      </Section>

      <Section id="states" title="states">
        <p className="st-b-copy">
          in light, hover and press overprint key on the ink. in dark the default takes the outline&apos;s hover and
          press. focus is the 2&nbsp;px house ring, 2&nbsp;px outside the button.
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
