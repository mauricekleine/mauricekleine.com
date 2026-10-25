import { createFileRoute } from "@tanstack/react-router";
import { IconsExample, StatusGlyphsExample } from "@/examples/glyphs";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/glyphs")({
  staticData: {
    sections: [
      { id: "icons", title: "icons" },
      { id: "status", title: "status glyphs" },
      { id: "use", title: "use" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="glyphs"
        lede="the pixel icons and status glyphs, drawn as whole-pixel squares in the current colour."
      >
        <InstallLine items={["glyphs"]} />
      </PageHead>
      <Section id="icons" title="icons">
        <p className="st-pass-prose">
          twelve cells each, for controls. each prints at 2x, then at its own size beside its name.
        </p>
        <ModePair>
          <IconsExample />
        </ModePair>
      </Section>
      <Section id="status" title="status glyphs">
        <p className="st-pass-prose">
          a status square is fourteen cells with notched corners and its glyph knocked out, in the state&rsquo;s own
          ink. below the squares are the bare glyphs; <code>bang</code> marks a field that needs fixing.
        </p>
        <ModePair>
          <StatusGlyphsExample />
        </ModePair>
      </Section>
      <Section id="use" title="use">
        <p className="st-pass-prose">
          <code>&lt;Icon name=&quot;copy&quot; /&gt;</code> and{" "}
          <code>&lt;StatusGlyph state=&quot;done&quot; /&gt;</code>. both stay hidden from screen readers until you give
          them an <code>aria-label</code>. keep them at their own size or a whole multiple of it, so every cell stays a
          whole pixel. there is no upstream item: when superthread seeds an item from base-nova, its icon placeholders
          become these glyphs.
        </p>
      </Section>
    </>
  );
}
