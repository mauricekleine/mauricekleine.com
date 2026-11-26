import { createFileRoute } from "@tanstack/react-router";
import { DoorExample, OnwardExample } from "@/examples/onward";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/onward")({
  staticData: {
    sections: [
      { id: "onward", title: "Onward" },
      { id: "door", title: "Door" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Onward"
        lede="The way onward from a page: a word and its arrow, or a door, one line of words with an arrow."
      >
        <InstallLine items={["onward"]} />
      </PageHead>
      <Section id="onward" title="Onward">
        <p className="st-pass-prose">
          A foreground link at the UI step, for the next place a page sends you. <code>back</code> leads with the left
          arrow. It underlines on hover and reaches 44 px on a phone through its hit area. A section&rsquo;s muted{" "}
          <code>SectionAction</code> stays beside its title; this one stands on its own.
        </p>
        <ModePair>
          <OnwardExample />
        </ModePair>
      </Section>
      <Section id="door" title="Door">
        <p className="st-pass-prose">
          A door leaves a finished place in one line. It is 40 px tall, 44 px on a phone, and only its words underline.
          Long words truncate before they wrap. A door carries no number, because a count on the way out asks you to
          stay.
        </p>
        <ModePair>
          <DoorExample />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Onward</code>
          </dt>
          <dd>
            The word and its arrow. Takes <code>back</code>, and the app&rsquo;s router link through <code>render</code>
            .
          </dd>
          <dt>
            <code>Door</code>
          </dt>
          <dd>
            One line of words and an arrow. Takes the app&rsquo;s router link through <code>render</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
