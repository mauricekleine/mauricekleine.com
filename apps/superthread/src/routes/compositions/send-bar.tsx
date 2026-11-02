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
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/send-bar")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "one", title: "one recipient" },
      { id: "states", title: "states" },
      { id: "panel", title: "in the panel" },
      { id: "narrow", title: "in a narrow column" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function People() {
  return (
    <SendBarFacts>
      <SendBarLabel>to</SendBarLabel>
      <SendBarFact address="sam@quanta.example">sam okafor</SendBarFact>
      <SendBarLabel>cc</SendBarLabel>
      <SendBarFact address="mina@quanta.example">mina rao</SendBarFact>
      <SendBarFact address="lee@quanta.example">lee park</SendBarFact>
      <SendBarLabel>attaches</SendBarLabel>
      <SendBarFile>chapter-7-notes.pdf</SendBarFile>
    </SendBarFacts>
  );
}

function Example() {
  const [sent, setSent] = useState(false);
  return (
    <SendBar aria-label="where it goes">
      <SendBarTo>
        <SendBarTitle>{sent ? "went to 3 people" : "goes to 3 people"}</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton disabled={sent} onClick={() => setSent(true)}>
          {sent ? "sent to 3 people" : "send to 3 people"}
        </SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function OneRecipient() {
  return (
    <SendBar aria-label="where it goes">
      <SendBarTo>
        <SendBarTitle>sam okafor</SendBarTitle>
        <SendBarAddress>sam@quanta.example</SendBarAddress>
      </SendBarTo>
      <SendBarActions>
        <SendBarButton>send to sam</SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function Sent() {
  return (
    <SendBar aria-label="where it went">
      <SendBarTo>
        <SendBarTitle>went to 3 people</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton disabled>sent to 3 people</SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

function Handoff() {
  return (
    <SendBar aria-label="where it goes">
      <SendBarTo>
        <SendBarTitle>in your outlook drafts</SendBarTitle>
        <SendBarAddress>sam@quanta.example</SendBarAddress>
      </SendBarTo>
      <SendBarActions>
        <SendBarLink href="#states">open in outlook</SendBarLink>
        <SendBarNote>you send it from there.</SendBarNote>
      </SendBarActions>
    </SendBar>
  );
}

function Uncertain() {
  return (
    <SendBar aria-label="where it goes">
      <SendBarTo>
        <SendBarTitle>this may have gone out</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarLink href="#states">open sent items</SendBarLink>
        <SendBarButton variant="outline" aria-label="retry, sends to 3 people">
          retry
        </SendBarButton>
        <SendBarNote>retry can send it twice, so check first.</SendBarNote>
      </SendBarActions>
    </SendBar>
  );
}

function Focused() {
  return (
    <SendBar aria-label="where it goes">
      <SendBarTo>
        <SendBarTitle>goes to 3 people</SendBarTitle>
        <People />
      </SendBarTo>
      <SendBarActions>
        <SendBarButton data-demo="focus-visible" tabIndex={-1}>
          send to 3 people
        </SendBarButton>
      </SendBarActions>
    </SendBar>
  );
}

const states = [
  { name: "ready", note: "key, the whole column", specimen: <Focused /> },
  { name: "sent", note: "no fill, same place, same width", specimen: <Sent /> },
  { name: "handoff", note: "a link: the send happens elsewhere", specimen: <Handoff /> },
  { name: "uncertain", note: "check first, retry beside it", specimen: <Uncertain /> },
];

function InAPanel() {
  return (
    <AppShellPanel>
      <Letter aria-label="the draft, and where it goes">
        <LetterHead>
          <LetterSubject>re: chapter 7 notes</LetterSubject>
          <LetterKind>reply · mail</LetterKind>
        </LetterHead>
        <LetterBody>the next draft goes up on thursday.</LetterBody>
        <Example />
      </Letter>
    </AppShellPanel>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="send bar"
        lede="the foot of a review: who the writing goes to, every address and file, and the one way out."
      >
        <InstallLine items={["send-bar"]} />
      </PageHead>
      <Serves name="send-bar" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          tab to the button and press space, or click it. enter does nothing, so a key held from the last field
          can&rsquo;t send. the title says what happened, and the button stays where it was.
        </p>
        <ModePair className="st-ca-wide-pair">
          <Example />
        </ModePair>
      </Section>
      <Section id="one" title="one recipient">
        <p className="st-ca-copy">one person needs no facts: their name is the title and the address sits under it.</p>
        <ModePair className="st-ca-wide-pair">
          <OneRecipient />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          the bar prints on paper, so it reads the light roles in both modes. it&rsquo;s a key block: the send prints in
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
      <Section id="panel" title="in the panel">
        <p className="st-ca-copy">
          as the letter&rsquo;s foot in a full working panel, names and addresses share their columns across the rows.
          both frames use an 880 px viewport.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="send bar in the panel, light" width={880} height={400}>
              <InAPanel />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="send bar in the panel, dark" width={880} height={400}>
              <InAPanel />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="narrow" title="in a narrow column">
        <p className="st-ca-copy">
          the bar answers to its own width. under 732 px the address drops below its name, and under 592 px the action
          moves below the facts.
        </p>
        <ModePair>
          <Example />
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-ca-copy">
          as the letter&rsquo;s foot inside the working panel, the bar runs to the screen&rsquo;s edges and down to the
          panel&rsquo;s foot. both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="send bar phone, light" height={540}>
              <InAPanel />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="send bar phone, dark" height={540}>
              <InAPanel />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>SendBar</code>
          </dt>
          <dd>
            the paper, a <code>section</code>. name it with <code>aria-label</code>. it holds two columns,{" "}
            <code>SendBarTo</code> and <code>SendBarActions</code>.
          </dd>
          <dt>
            <code>SendBarTitle</code>
          </dt>
          <dd>where it goes or where it went, in the display face. it announces itself when it changes.</dd>
          <dt>
            <code>SendBarAddress</code>
          </dt>
          <dd>one address under the title, for a single recipient.</dd>
          <dt>
            <code>SendBarFacts</code>
          </dt>
          <dd>
            the list, with <code>SendBarLabel</code> for each word. a <code>SendBarFact</code> is a person with an{" "}
            <code>address</code>, a <code>SendBarFile</code> is a file. several sit under one label.
          </dd>
          <dt>
            <code>SendBarButton</code>
          </dt>
          <dd>
            the send, in key, or a second action with <code>variant=&quot;outline&quot;</code>. enter never fires it,
            and a label naming the reach tells a screen reader what a short word sends.
          </dd>
          <dt>
            <code>SendBarLink</code>
          </dt>
          <dd>
            a handoff in key, for a send that happens elsewhere. takes an <code>href</code> or the app&rsquo;s router
            link through <code>render</code>, and enter opens it.
          </dd>
          <dt>
            <code>SendBarNote</code>
          </dt>
          <dd>one muted line under the action: why it works this way, or what to check first.</dd>
        </dl>
      </Section>
    </>
  );
}
