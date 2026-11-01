import { createFileRoute } from "@tanstack/react-router";
import { NativeSelectExample, NativeSelectSizes, NativeSelectStates } from "@/examples/native-select";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/native-select")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "sizes", title: "sizes" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="native select"
        lede="the native browser choice inside a square field box. the chevron stays quiet while the box draws the inside focus edge."
      >
        <InstallLine items={["native-select"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          choose the ship new runs open in. the browser supplies the open menu, option groups and keyboard navigation.
          trisys shows an unavailable option.
        </p>
        <ModePair>
          <NativeSelectExample />
        </ModePair>
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-e-copy">
          default is 40 px high and small is 32 px, and both are 44 px on a phone. the native options and right-hand
          chevron stay the same.
        </p>
        <ModePair className="st-e-wide">
          <NativeSelectSizes />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          rest and hover keep the input edge. focus draws 2 px inside, in the error ink when invalid. disabled uses
          faint stock and disabled words. the open menu belongs to the browser.
        </p>
        <ModePair className="st-e-wide">
          <NativeSelectStates />
        </ModePair>
      </Section>
    </>
  );
}
