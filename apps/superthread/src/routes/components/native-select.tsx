import { createFileRoute } from "@tanstack/react-router";
import {
  NativeSelectExample,
  NativeSelectQuiet,
  NativeSelectQuietStates,
  NativeSelectSizes,
  NativeSelectStates,
} from "@/examples/native-select";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/native-select")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "sizes", title: "Sizes" },
      { id: "states", title: "States" },
      { id: "quiet", title: "The quiet form" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Native select"
        lede="The native browser choice inside a square field box, or a quiet word beside a list. The chevron stays quiet while the box draws the inside focus edge."
      >
        <InstallLine items={["native-select"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Choose the ship new runs open in. The browser supplies the open menu, option groups and keyboard navigation.
          Trisys shows an unavailable option.
        </p>
        <ModePair>
          <NativeSelectExample />
        </ModePair>
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-e-copy">
          Default is 40 px high and small is 32 px, and both are 44 px on a phone. The native options and right-hand
          chevron stay the same.
        </p>
        <ModePair className="st-e-wide">
          <NativeSelectSizes />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          Rest and hover keep the input edge. Focus draws 2 px inside, in the error ink when invalid. Disabled uses
          faint stock and disabled words. The open menu belongs to the browser.
        </p>
        <ModePair className="st-e-wide">
          <NativeSelectStates />
        </ModePair>
      </Section>
      <Section id="quiet" title="The quiet form">
        <p className="st-e-copy">
          <code>variant=&quot;quiet&quot;</code> sets a scope beside a list: a muted word and its chevron, right-aligned
          with no box, 44 px at every width. The word turns foreground on hover, and keyboard focus draws the same 2 px
          edge inside its 44 px. The browser still supplies the menu.
        </p>
        <ModePair>
          <NativeSelectQuiet />
        </ModePair>
        <ModePair className="st-e-wide">
          <NativeSelectQuietStates />
        </ModePair>
      </Section>
    </>
  );
}
