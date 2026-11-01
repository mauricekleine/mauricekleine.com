import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  Letter,
  LetterActions,
  LetterBody,
  LetterHead,
  LetterKind,
  LetterSource,
  LetterSubject,
  LetterTools,
} from "@/components/superthread/blocks/letter";
import { Button } from "@/components/superthread/ui/button";
import { Paper } from "@/components/superthread/ui/paper";
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/letter")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "whole", title: "the whole body" },
      { id: "foot", title: "with a foot" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Tools() {
  return (
    <LetterTools>
      <LetterActions>
        <Button variant="ghost">edit</Button>
        <Button variant="outline">reject</Button>
      </LetterActions>
      <LetterSource href="#whole">sam&rsquo;s mail, mon 2 nov</LetterSource>
    </LetterTools>
  );
}

function ShortLetter() {
  return (
    <Letter aria-label="the draft, as it goes out">
      <LetterHead>
        <LetterSubject>re: chapter 7 notes</LetterSubject>
        <LetterKind>reply · mail</LetterKind>
      </LetterHead>
      <LetterBody>
        <p>hi sam,</p>
        <p>
          thanks for the notes. the three figures stay, and the bands move to the end of the chapter so the reader meets
          the result first.
        </p>
        <p>the next draft goes up on thursday.</p>
        <p>maurice</p>
      </LetterBody>
      <Tools />
    </Letter>
  );
}

const longBody = `hi sam,

the outline for chapter 8 is below, with the order i'd like to try. it runs long, so here's all of it.

1. start at the barrier, with one electron and one wall.
2. show the wave reaching the far side before naming tunnelling.
3. work the number for a wall a few atoms thick.
4. give the reader the scanning microscope as the first thing it builds.

the figures sit in https://quanta.example/chapters/08-tunnelling/figures/draft-3/barrier-and-wave-at-three-widths.png if you want them first.

two open questions.

does the transistor belong here, or in the chapter after? i lean towards after, since it needs bands.

should the worked number use metres or nanometres? nanometres read better, but the reader has only met metres so far.

no rush on either. i'll hold the draft until you've read this.

maurice`;

function LongLetter() {
  return (
    <Letter aria-label="a long draft, whole">
      <LetterHead>
        <LetterSubject>fwd: outline for chapter 8, with the order, the figures and two open questions</LetterSubject>
        <LetterKind>forward · mail</LetterKind>
      </LetterHead>
      <LetterBody>{longBody}</LetterBody>
      <Tools />
    </Letter>
  );
}

function LetterWithFoot() {
  return (
    <Letter aria-label="the draft, and where it goes">
      <LetterHead>
        <LetterSubject>re: chapter 7 notes</LetterSubject>
        <LetterKind>reply · mail</LetterKind>
      </LetterHead>
      <LetterBody>the next draft goes up on thursday.</LetterBody>
      <Tools />
      <Paper render={<section aria-label="where it goes" />} className="st-paper-foot">
        <p className="type-title text-first">goes to sam</p>
        <Button variant="key" size="lg">
          send to sam
        </Button>
      </Paper>
    </Letter>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="letter"
        lede="a piece of writing read whole before someone acts on it: the subject and kind, all of the body, and what can be done to it."
      >
        <InstallLine items={["letter"]} />
      </PageHead>
      <Serves name="letter" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          the words sit at the reading measure on the page&rsquo;s own fill. a leading ghost takes the text&rsquo;s
          edge, so <code>edit</code> starts where the body starts.
        </p>
        <ModePair className="st-ca-wide-pair">
          <ShortLetter />
        </ModePair>
      </Section>
      <Section id="whole" title="the whole body">
        <p className="st-ca-copy">
          nothing clamps. a plain string keeps the line breaks it was written with, and a long link wraps so the letter
          holds its width. paragraphs passed as elements sit 12 px apart.
        </p>
        <ModePair className="st-ca-wide-pair">
          <LongLetter />
        </ModePair>
      </Section>
      <Section id="foot" title="with a foot">
        <p className="st-ca-copy">
          the box takes no padding of its own, so a block after the tools reaches both edges. this foot is paper.
        </p>
        <ModePair className="st-ca-wide-pair">
          <LetterWithFoot />
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-ca-copy">
          inside the working panel at 600 px and below, the letter gives up its side edges and takes the panel&rsquo;s
          whole width. as the panel&rsquo;s last block it runs down to the panel&rsquo;s foot. both frames use a 390 px
          viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="letter phone, light" height={560}>
              <AppShellPanel>
                <ShortLetter />
              </AppShellPanel>
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="letter phone, dark" height={560}>
              <AppShellPanel>
                <ShortLetter />
              </AppShellPanel>
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Letter</code>
          </dt>
          <dd>
            the ruled box, an <code>article</code>. name it with <code>aria-label</code>.
          </dd>
          <dt>
            <code>LetterHead</code>
          </dt>
          <dd>
            holds <code>LetterSubject</code>, a heading, and <code>LetterKind</code>, one muted line. render the subject
            a level down under a section&rsquo;s title.
          </dd>
          <dt>
            <code>LetterBody</code>
          </dt>
          <dd>the whole text, in reading type at 27.5 em. it also holds the field that edits the text.</dd>
          <dt>
            <code>LetterTools</code>
          </dt>
          <dd>
            the row under the body: <code>LetterActions</code> for the app&rsquo;s buttons, then{" "}
            <code>LetterSource</code>, a quiet link to what the writing answers.
          </dd>
        </dl>
      </Section>
    </>
  );
}
