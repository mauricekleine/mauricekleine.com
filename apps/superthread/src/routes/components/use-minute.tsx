import { createFileRoute } from "@tanstack/react-router";
import { UseMinuteExample } from "@/examples/use-minute";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/use-minute")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "midnight", title: "midnight" },
      { id: "hidden", title: "hidden" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="use-minute"
        lede="a hook that returns the clock's minute and the reader's day, for any line that prints how long until or how long since."
      >
        <InstallLine items={["use-minute"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-pass-prose">
          <code>useMinute(&#123; timeZone &#125;)</code> returns <code>now</code>, a <code>Date</code> on the whole
          minute, and <code>day</code>, like <code>2026-11-03</code>. it returns <code>null</code> while the page is
          prerendered, because a server has no reader&rsquo;s clock. feed <code>now</code> to the time words, and a part
          minute stays out of them.
        </p>
        <ModePair>
          <UseMinuteExample />
        </ModePair>
      </Section>
      <Section id="midnight" title="midnight">
        <p className="st-pass-prose">
          the timer lands on the clock&rsquo;s next whole minute, so midnight is an ordinary tick. <code>day</code>{" "}
          changes on that tick, in the reader&rsquo;s zone. a page that reads its data once keys that read on{" "}
          <code>day</code>, and tomorrow arrives without a reload.
        </p>
      </Section>
      <Section id="hidden" title="hidden">
        <p className="st-pass-prose">
          every caller on a page shares one timer, and the timer stops while the page is hidden. the moment the page
          shows again it reads the clock, so a laptop opened in the morning prints the morning.
        </p>
      </Section>
    </>
  );
}
