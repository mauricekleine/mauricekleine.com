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
import {
  SendBar,
  SendBarActions,
  SendBarAddress,
  SendBarButton,
  SendBarTitle,
  SendBarTo,
} from "@/components/superthread/blocks/send-bar";
import { Button } from "@/components/superthread/ui/button";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/letter")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "whole", title: "The whole body" },
      { id: "foot", title: "With a foot" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Tools() {
  return (
    <LetterTools>
      <LetterActions>
        <Button variant="ghost">Edit</Button>
        <Button variant="outline">Reject</Button>
      </LetterActions>
      <LetterSource href="#whole">Sam&rsquo;s mail, Mon 2 Nov</LetterSource>
    </LetterTools>
  );
}

function ShortLetter({ last }: { last?: boolean }) {
  return (
    <Letter aria-label="The draft, as it goes out" last={last}>
      <LetterHead>
        <LetterSubject>Re: chapter 7 notes</LetterSubject>
        <LetterKind>Reply · mail</LetterKind>
      </LetterHead>
      <LetterBody>
        <p>Hi Sam,</p>
        <p>
          Thanks for the notes. The three figures stay, and the bands move to the end of the chapter so the reader meets
          the result first.
        </p>
        <p>The next draft goes up on Thursday.</p>
        <p>Maurice</p>
      </LetterBody>
      <Tools />
    </Letter>
  );
}

const longBody = `Hi Sam,

The outline for chapter 8 is below, with the order I'd like to try. It runs long, so here's all of it.

1. Start at the barrier, with one electron and one wall.
2. Show the wave reaching the far side before naming tunnelling.
3. Work the number for a wall a few atoms thick.
4. Give the reader the scanning microscope as the first thing it builds.

The figures sit in https://quanta.example/chapters/08-tunnelling/figures/draft-3/barrier-and-wave-at-three-widths.png if you want them first.

Two open questions.

Does the transistor belong here, or in the chapter after? I lean towards after, since it needs bands.

Should the worked number use metres or nanometres? Nanometres read better, but the reader has only met metres so far.

No rush on either. I'll hold the draft until you've read this.

Maurice`;

function LongLetter() {
  return (
    <Letter aria-label="A long draft, whole">
      <LetterHead>
        <LetterSubject>Fwd: outline for chapter 8, with the order, the figures and two open questions</LetterSubject>
        <LetterKind>Forward · mail</LetterKind>
      </LetterHead>
      <LetterBody>{longBody}</LetterBody>
      <Tools />
    </Letter>
  );
}

function LetterWithFoot() {
  return (
    <Letter aria-label="The draft, and where it goes">
      <LetterHead>
        <LetterSubject>Re: chapter 7 notes</LetterSubject>
        <LetterKind>Reply · mail</LetterKind>
      </LetterHead>
      <LetterBody>The next draft goes up on Thursday.</LetterBody>
      <Tools />
      <SendBar aria-label="Where it goes">
        <SendBarTo>
          <SendBarTitle>Sam Okafor</SendBarTitle>
          <SendBarAddress>sam@quanta.example</SendBarAddress>
        </SendBarTo>
        <SendBarActions>
          <SendBarButton>Send to Sam</SendBarButton>
        </SendBarActions>
      </SendBar>
    </Letter>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Letter"
        lede="A piece of writing read whole before someone acts on it: the subject and kind, all of the body, and what can be done to it."
      >
        <InstallLine items={["letter"]} />
      </PageHead>
      <Serves name="letter" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          The words sit at the reading measure on the page&rsquo;s own fill. A leading ghost takes the text&rsquo;s
          edge, so <code>edit</code> starts where the body starts.
        </p>
        <ModePair className="st-ca-wide-pair">
          <ShortLetter />
        </ModePair>
      </Section>
      <Section id="whole" title="The whole body">
        <p className="st-ca-copy">
          Nothing clamps. A plain string keeps the line breaks it was written with, and a long link wraps so the letter
          holds its width. Paragraphs passed as elements sit 12 px apart.
        </p>
        <ModePair className="st-ca-wide-pair">
          <LongLetter />
        </ModePair>
      </Section>
      <Section id="foot" title="With a foot">
        <p className="st-ca-copy">
          The box takes no padding of its own, so a block after the tools reaches both edges. This foot is a{" "}
          <a href="/compositions/send-bar">send bar</a>.
        </p>
        <ModePair className="st-ca-wide-pair">
          <LetterWithFoot />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-ca-copy">
          Inside the working panel at 600 px and below, the letter gives up its side edges and takes the panel&rsquo;s
          whole width. <code>last</code> says nothing follows it in the panel, so it runs down to the panel&rsquo;s foot
          too. Both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Letter phone, light" height={430}>
              <AppShellPanel>
                <ShortLetter last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Letter phone, dark" height={430}>
              <AppShellPanel>
                <ShortLetter last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Letter</code>
          </dt>
          <dd>
            The ruled box, an <code>article</code>. Name it with <code>aria-label</code>. Set <code>last</code> when
            nothing follows it in the working panel.
          </dd>
          <dt>
            <code>LetterHead</code>
          </dt>
          <dd>
            Holds <code>LetterSubject</code>, a heading, and <code>LetterKind</code>, one muted line. Render the subject
            a level down under a section&rsquo;s title.
          </dd>
          <dt>
            <code>LetterBody</code>
          </dt>
          <dd>The whole text, in reading type at 27.5 em. It also holds the field that edits the text.</dd>
          <dt>
            <code>LetterTools</code>
          </dt>
          <dd>
            The row under the body: <code>LetterActions</code> for the app&rsquo;s buttons, then{" "}
            <code>LetterSource</code>, a quiet link to what the writing answers.
          </dd>
        </dl>
      </Section>
    </>
  );
}
