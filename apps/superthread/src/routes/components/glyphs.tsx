import { createFileRoute } from "@tanstack/react-router";
import { IconsExample, StateWordsExample, StatusGlyphsExample } from "@/examples/glyphs";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/glyphs")({
  staticData: {
    sections: [
      { id: "icons", title: "Icons" },
      { id: "status", title: "Status glyphs" },
      { id: "state", title: "State words" },
      { id: "use", title: "Use" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Glyphs"
        lede="The pixel icons and status glyphs, drawn as whole-pixel squares in the current colour, and a state word beside its 8 px square."
      >
        <InstallLine items={["glyphs"]} />
      </PageHead>
      <Section id="icons" title="Icons">
        <p className="st-pass-prose">
          Twelve cells each, for controls. Each prints at 2x, then at its own size beside its name.
        </p>
        <ModePair>
          <IconsExample />
        </ModePair>
      </Section>
      <Section id="status" title="Status glyphs">
        <p className="st-pass-prose">
          A status square is fourteen cells with notched corners and its glyph knocked out, in the state&rsquo;s own
          ink. Below the squares are the bare glyphs; <code>bang</code> marks a field that needs fixing.
        </p>
        <ModePair>
          <StatusGlyphsExample />
        </ModePair>
      </Section>
      <Section id="state" title="State words">
        <p className="st-pass-prose">
          <code>StateWord</code> prints a state as a word beside an 8 px square in the word&rsquo;s ink: filled and in
          foreground when it&rsquo;s on, empty and muted when it&rsquo;s off. The word is the ship&rsquo;s own, and it
          reads <code>on</code> or <code>off</code> when given none. It prints where an on or off fact sits in a list,
          such as a schedule that&rsquo;s running.
        </p>
        <ModePair>
          <StateWordsExample />
        </ModePair>
      </Section>
      <Section id="use" title="Use">
        <p className="st-pass-prose">
          <code>&lt;Icon name=&quot;copy&quot; /&gt;</code> and{" "}
          <code>&lt;StatusGlyph state=&quot;done&quot; /&gt;</code>. Both stay hidden from screen readers until you give
          them an <code>aria-label</code>. Keep them at their own size or a whole multiple of it, so every cell stays a
          whole pixel. There is no upstream item: when Superthread seeds an item from base-nova, its icon placeholders
          become these glyphs.
        </p>
      </Section>
    </>
  );
}
