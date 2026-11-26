import { createFileRoute } from "@tanstack/react-router";
import { FitTitleByWidth, FitTitleByWords, FitTitleCut, FitTitleInHeader } from "@/examples/fit-title";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/fit-title")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "widths", title: "At any width" },
      { id: "the-cut", title: "The cut" },
      { id: "lines", title: "By lines" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Fit title"
        lede="A title that steps down until the whole of it fits its box. It measures the words, so it never guesses from how many there are."
      >
        <InstallLine items={["fit-title"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-pass-prose">
          The ladder runs hero, headline, section, long, and the title prints at the first step that holds all of it in
          the box. Hero needs a full panel&rsquo;s 784 px, so anything narrower starts at headline and a phone never
          prints hero. Clear&rsquo;s claim runs the same way one step up: display at a full panel, hero below it.
        </p>
        <ModePair className="st-cb-stack">
          <FitTitleByWords />
        </ModePair>
      </Section>
      <Section id="widths" title="At any width">
        <p className="st-pass-prose">
          The same words at three widths. The title fits again when its box changes size and when a face arrives.
        </p>
        <ModePair className="st-cb-stack">
          <FitTitleByWidth />
        </ModePair>
      </Section>
      <Section id="the-cut" title="The cut">
        <p className="st-pass-prose">
          Past the foot of the ladder the title cuts at the last whole word that fits, measured at the width it prints.
          A screen reader still gets every word, and so does the tooltip. Touch has no hover, so a title that can cut
          links to the page that prints it whole.
        </p>
        <ModePair>
          <FitTitleCut />
        </ModePair>
      </Section>
      <Section id="lines" title="By lines">
        <p className="st-pass-prose">
          Outside a held box, <code>lines</code> gives the title its room and <code>steps</code> gives it a shorter
          ladder, so a run&rsquo;s page header stays at the size of every other page.
        </p>
        <ModePair>
          <FitTitleInHeader />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>FitTitle</code>
          </dt>
          <dd>
            The heading, an <code>h1</code> until <code>render</code> says otherwise. Its children are the title as one
            string. Give it a height from its slot, or pass <code>lines</code>.
          </dd>
          <dt>
            <code>steps</code>
          </dt>
          <dd>The steps it may print, largest first.</dd>
          <dt>
            <code>lines</code>
          </dt>
          <dd>The most lines it may take, in place of a held height.</dd>
          <dt>
            <code>href</code>, <code>link</code>
          </dt>
          <dd>
            Where the whole title prints: a plain <code>href</code>, or the app&rsquo;s router link through{" "}
            <code>link</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
