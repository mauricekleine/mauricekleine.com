import { createFileRoute } from "@tanstack/react-router";
import { SheetExample } from "@/examples/sheet";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sheet")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "upstream", title: "upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="sheet"
        lede="a panel that slides in from an edge of the window and keeps focus until it closes. on a phone, this site's menu is a sheet."
      >
        <InstallLine items={["sheet"]} />
      </PageHead>
      <Section id="example" title="example">
        <ModePair light={<SheetExample mode="light" />} dark={<SheetExample mode="dark" />} />
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          base-nova&rsquo;s sheet, built on base ui&rsquo;s dialog. superthread changes its imports and draws its close
          button with the close glyph; every class is upstream&rsquo;s. the sheet renders at the end of the page, so it
          takes the page&rsquo;s mode unless you give it one:{" "}
          <code>&lt;SheetContent className=&quot;dark&quot;&gt;</code>, as each pane here does.
        </p>
      </Section>
    </>
  );
}
