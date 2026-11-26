import { createFileRoute } from "@tanstack/react-router";
import {
  DropdownMenuExample,
  DropdownMenuOpen,
  DropdownMenuStates,
  DropdownMenuVariants,
} from "@/examples/dropdown-menu";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/dropdown-menu")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "variants", title: "Variants" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Dropdown menu"
        lede="Actions in a leaf list, with checks, choices and submenus. The list floats 6 px from its trigger and keeps a screened contact edge in light."
      >
        <InstallLine items={["dropdown-menu"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Open the run menu. Change notifications, move the run to another ship, or choose an action.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<DropdownMenuExample mode="light" />}
          dark={<DropdownMenuExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          The parent list and its ship submenu, printed in place. The checked row and the chosen ship keep their own
          indicator columns.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="variants" title="Variants">
        <p className="st-gl-copy">
          Default actions, inset words and destructive actions share the same 36 px row, 44 px on a phone. Destructive
          uses key ink and the trash glyph.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuVariants />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          The trigger keeps its control ring outside. Inside the list, focus stays inside the row and highlight uses the
          raised hover fill.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuStates />
        </ModePair>
      </Section>
    </>
  );
}
