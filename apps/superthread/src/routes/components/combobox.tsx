import { createFileRoute } from "@tanstack/react-router";
import { ComboboxExample, ComboboxMultiple, ComboboxOpen, ComboboxStates } from "@/examples/combobox";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/combobox")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "selection", title: "Selection" },
      { id: "open", title: "Open" },
      { id: "empty", title: "Empty" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Combobox"
        lede="A searchable field with a leaf list below it. The field owns the inside focus edge; the chosen option keeps its check over the raised hover fill."
      >
        <InstallLine items={["combobox"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Find a ship by name. Clear the value to start again, or type a name the list does not contain to see the empty
          result.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<ComboboxExample mode="light" />}
          dark={<ComboboxExample mode="dark" />}
        />
      </Section>
      <Section id="selection" title="Selection">
        <p className="st-gl-copy">
          Multiple selection keeps each ship in a 24 px chip. The list anchors to the whole field, and each chip has a
          remove control.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<ComboboxMultiple mode="light" />}
          dark={<ComboboxMultiple mode="dark" />}
        />
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          Quanta is under the pointer; Trisys is chosen. The list scrolls inside the leaf, leaving the contact edge
          outside.
        </p>
        <ModePair className="st-gl-pair">
          <ComboboxOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="empty" title="Empty">
        <p className="st-gl-copy">A search with no match keeps its field and explains the empty list.</p>
        <ModePair className="st-gl-pair">
          <ComboboxOpen empty />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          The input-group box thickens on focus. Invalid changes the edge and focus ink together; disabled keeps the
          full box.
        </p>
        <ModePair className="st-gl-pair">
          <ComboboxStates />
        </ModePair>
      </Section>
    </>
  );
}
