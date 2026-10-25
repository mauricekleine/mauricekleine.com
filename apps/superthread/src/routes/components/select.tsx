import { createFileRoute } from "@tanstack/react-router";
import { SelectExample, SelectOpen, SelectStates } from "@/examples/select";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/select")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="select"
        lede="a field that opens a list. the trigger is the box, so focus draws its 2 px frame inside it, and the list floats over the page on a raised layer."
      >
        <InstallLine items={["select"]} />
      </PageHead>

      <Section id="example" title="example">
        <p className="st-a-copy">
          pick with the pointer, or focus the trigger and use the arrow keys, or type a ship's first letters. the last
          select has no ship yet, so it holds the error ink until you pick one. a disabled trigger keeps a flat fill and
          its full edge.
        </p>
        <ModePair className="st-a-stack" light={<SelectExample mode="light" />} dark={<SelectExample mode="dark" />} />
      </Section>

      <Section id="open" title="open">
        <p className="st-a-copy">
          the list, printed open: the row under the pointer takes the raised hover fill, and the chosen ship is boxed in
          the house ink with a tick. in light its lift prints as a screen where the list meets the page; in dark it
          stays soft.
        </p>
        <ModePair className="st-a-stack" light={<SelectOpen mode="light" />} dark={<SelectOpen mode="dark" />} />
        <Caption detail="contact" />
      </Section>

      <Section id="states" title="states">
        <p className="st-a-copy">
          the trigger draws the input's frame: 1 px at rest and 2 px inside on focus, by tab or by click, in the error
          ink while nothing is picked.
        </p>
        <ModePair className="st-a-stack" light={<SelectStates mode="light" />} dark={<SelectStates mode="dark" />} />
      </Section>
    </>
  );
}
