import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { Letter, LetterBody, LetterHead, LetterKind, LetterSubject } from "@/components/superthread/blocks/letter";
import {
  SendBar,
  SendBarActions,
  SendBarAddress,
  SendBarButton,
  SendBarFact,
  SendBarFacts,
  SendBarFile,
  SendBarLabel,
  SendBarLink,
  SendBarNote,
  SendBarTitle,
  SendBarTo,
} from "@/components/superthread/blocks/send-bar";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/send-bar")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "one", title: "One recipient" },
      { id: "states", title: "States" },
      { id: "panel", title: "In the panel" },
      { id: "narrow", title: "In a narrow column" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function People() {
  return (
    <SendBarFacts>
      <SendBarLabel>To</SendBarLabel>
      <SendBarFact address="sam@quanta.example">Sam Okafor</SendBarFact>
      <SendBarLabel>CC</SendBarLabel>
      <SendBarFact address="mina@quanta.example">Mina Rao</SendBarFact>
      <SendBarFact address="lee@quanta.example">Lee Park</SendBarFact>
      <SendBarLabel>Attaches</SendBarLabel>
      <SendBarFile>chapter-7-notes.pdf</SendBarFile>
    </SendBarFacts>
  );
}

function Example() {
  const [sent, setSent] = useState(false);
  return (
    <SendBar aria-label="Where it goes">
      <SendBarTo>
        <SendBarTitle>{sent ? "Went to 3 people" : "Goes to 3 people"}</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton disabled={sent} onClick={() => setSent(true)}>
          {sent ? "Sent to 3 people" : "Send to 3 people"}
        </SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function OneRecipient() {
  return (
    <SendBar aria-label="Where it goes">
      <SendBarTo>
        <SendBarTitle>Sam Okafor</SendBarTitle>
        <SendBarAddress>sam@quanta.example</SendBarAddress>
      </SendBarTo>
      <SendBarActions>
        <SendBarButton>Send to Sam</SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function Sent() {
  return (
    <SendBar aria-label="Where it went">
      <SendBarTo>
        <SendBarTitle>Went to 3 people</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton disabled>Sent to 3 people</SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function Handoff() {
  return (
    <SendBar aria-label="Where it goes">
      <SendBarTo>
        <SendBarTitle>In your Outlook drafts</SendBarTitle>
        <SendBarAddress>sam@quanta.example</SendBarAddress>
      </SendBarTo>
      <SendBarActions>
        <SendBarLink href="#states">Open in Outlook</SendBarLink>
        <SendBarNote>You send it from there.</SendBarNote>
      </SendBarActions>
    </SendBar>
  );
}

function Uncertain() {
  return (
    <SendBar aria-label="Where it goes">
      <SendBarTo>
        <SendBarTitle>This may have gone out</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarLink href="#states">Open sent items</SendBarLink>
        <SendBarButton variant="outline" aria-label="Retry, sends to 3 people">
          Retry
        </SendBarButton>
        <SendBarNote>Retry can send it twice, so check first.</SendBarNote>
      </SendBarActions>
    </SendBar>
  );
}

function Focused() {
  return (
    <SendBar aria-label="Where it goes">
      <SendBarTo>
        <SendBarTitle>Goes to 3 people</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton data-demo="focus-visible" tabIndex={-1}>
          Send to 3 people
        </SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

const states = [
  { name: "Ready", note: "Key, the whole column", specimen: <Focused /> },
  { name: "Sent", note: "No fill, same place, same width", specimen: <Sent /> },
  { name: "Handoff", note: "A link: the send happens elsewhere", specimen: <Handoff /> },
  { name: "Uncertain", note: "Check first, retry beside it", specimen: <Uncertain /> },
];

function InAPanel() {
  return (
    <AppShellPanel>
      <Letter aria-label="The draft, and where it goes" last>
        <LetterHead>
          <LetterSubject>Re: chapter 7 notes</LetterSubject>
          <LetterKind>Reply · mail</LetterKind>
        </LetterHead>
        <LetterBody>The next draft goes up on Thursday.</LetterBody>
        <Example />
      </Letter>
    </AppShellPanel>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Send bar"
        lede="The foot of a review: who the writing goes to, every address and file, and the one way out."
      >
        <InstallLine items={["send-bar"]} />
      </PageHead>
      <Serves name="send-bar" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Tab to the button and press Space, or click it. Enter does nothing, so a key held from the last field
          can&rsquo;t send. The title says what happened, and the button stays where it was.
        </p>
        <ModePair className="st-ca-wide-pair">
          <Example />
        </ModePair>
      </Section>
      <Section id="one" title="One recipient">
        <p className="st-ca-copy">One person needs no facts: their name is the title and the address sits under it.</p>
        <ModePair className="st-ca-wide-pair">
          <OneRecipient />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-ca-copy">
          The bar prints on paper, so it reads the light roles in both modes. It&rsquo;s a key block: the send prints in
          key, and the focus ring takes the first ink, where the rest of the page rings in the house ink.
        </p>
        <ModePair className="st-ca-wide-pair">
          <div className="st-ca-stack">
            {states.map((state) => (
              <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
                {state.specimen}
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="panel" title="In the panel">
        <p className="st-ca-copy">
          As the letter&rsquo;s foot in a full working panel, names and addresses share their columns across the rows.
          Both frames use an 880 px viewport.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="Send bar in the panel, light" width={880} height={480}>
              <InAPanel />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Send bar in the panel, dark" width={880} height={480}>
              <InAPanel />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="narrow" title="In a narrow column">
        <p className="st-ca-copy">
          The bar answers to its own width. Under 732 px the address drops below its name, and under 592 px the action
          moves below the facts.
        </p>
        <ModePair>
          <Example />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-ca-copy">
          As the foot of a letter marked <code>last</code>, the bar runs to the panel&rsquo;s edges and down to its
          foot. Both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Send bar phone, light" height={470}>
              <InAPanel />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Send bar phone, dark" height={470}>
              <InAPanel />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>SendBar</code>
          </dt>
          <dd>
            The paper, a <code>section</code>. Name it with <code>aria-label</code>. It holds two columns,{" "}
            <code>SendBarTo</code> and <code>SendBarActions</code>.
          </dd>
          <dt>
            <code>SendBarTitle</code>
          </dt>
          <dd>Where it goes or where it went, in the display face. It announces itself when it changes.</dd>
          <dt>
            <code>SendBarAddress</code>
          </dt>
          <dd>One address under the title, for a single recipient.</dd>
          <dt>
            <code>SendBarFacts</code>
          </dt>
          <dd>
            The list, with <code>SendBarLabel</code> for each word. A <code>SendBarFact</code> is a person with an{" "}
            <code>address</code>, a <code>SendBarFile</code> is a file. Several sit under one label.
          </dd>
          <dt>
            <code>SendBarButton</code>
          </dt>
          <dd>
            The send, in key, or a second action with <code>variant=&quot;outline&quot;</code>. Enter never fires it,
            even from a field in the same form, and a label naming the reach tells a screen reader what a short word
            sends.
          </dd>
          <dt>
            <code>SendBarLink</code>
          </dt>
          <dd>
            A handoff in key, for a send that happens elsewhere. Takes an <code>href</code> or the app&rsquo;s router
            link through <code>render</code>, and Enter opens it.
          </dd>
          <dt>
            <code>SendBarNote</code>
          </dt>
          <dd>One muted line under the action: why it works this way, or what to check first.</dd>
        </dl>
      </Section>
    </>
  );
}
