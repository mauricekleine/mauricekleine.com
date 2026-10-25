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
      { id: "example", title: "example" },
      { id: "selection", title: "selection" },
      { id: "open", title: "open" },
      { id: "empty", title: "empty" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="combobox"
        lede="a searchable field with a leaf list below it. the field owns the inside focus edge; the chosen option keeps its plum box and check."
      >
        <InstallLine items={["combobox"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          find a ship by name. clear the value to start again, or type a name the list does not contain to see the empty
          result.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<ComboboxExample mode="light" />}
          dark={<ComboboxExample mode="dark" />}
        />
      </Section>
      <Section id="selection" title="selection">
        <p className="st-gl-copy">
          multiple selection keeps each ship in a 24 px chip. the list anchors to the whole field, and each chip has a
          remove control.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<ComboboxMultiple mode="light" />}
          dark={<ComboboxMultiple mode="dark" />}
        />
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          quanta is under the pointer; trisys is chosen. the list scrolls inside the leaf, leaving the contact edge
          outside.
        </p>
        <ModePair className="st-gl-pair">
          <ComboboxOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="empty" title="empty">
        <p className="st-gl-copy">a search with no match keeps its field and explains the empty list.</p>
        <ModePair className="st-gl-pair">
          <ComboboxOpen empty />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          the input-group box thickens on focus. invalid changes the edge and focus ink together; disabled keeps the
          full box.
        </p>
        <ModePair className="st-gl-pair">
          <ComboboxStates />
        </ModePair>
      </Section>
    </>
  );
}
