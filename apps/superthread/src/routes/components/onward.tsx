import { createFileRoute } from "@tanstack/react-router";
import { DoorExample, OnwardExample } from "@/examples/onward";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/onward")({
  staticData: {
    sections: [
      { id: "onward", title: "onward" },
      { id: "door", title: "door" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="onward"
        lede="the way onward from a page: a word and its arrow, or a door, one line of words with an arrow."
      >
        <InstallLine items={["onward"]} />
      </PageHead>
      <Section id="onward" title="onward">
        <p className="st-pass-prose">
          a foreground link at the ui step, for the next place a page sends you. <code>back</code> leads with the left
          arrow. it underlines on hover and reaches 44 px on a phone through its hit area. a section&rsquo;s muted{" "}
          <code>SectionAction</code> stays beside its title; this one stands on its own.
        </p>
        <ModePair>
          <OnwardExample />
        </ModePair>
      </Section>
      <Section id="door" title="door">
        <p className="st-pass-prose">
          a door leaves a finished place in one line. it is 40 px tall, 44 px on a phone, and only its words underline.
          long words truncate before they wrap. a door carries no number, because a count on the way out asks you to
          stay.
        </p>
        <ModePair>
          <DoorExample />
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Onward</code>
          </dt>
          <dd>
            the word and its arrow. takes <code>back</code>, and the app&rsquo;s router link through <code>render</code>
            .
          </dd>
          <dt>
            <code>Door</code>
          </dt>
          <dd>
            one line of words and an arrow. takes the app&rsquo;s router link through <code>render</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
