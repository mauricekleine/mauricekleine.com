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
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "variants", title: "variants" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="dropdown menu"
        lede="actions in a leaf list, with checks, choices and submenus. the list floats 6 px from its trigger and keeps a screened contact edge in light."
      >
        <InstallLine items={["dropdown-menu"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          open the run menu. change notifications, move the run to another ship, or choose an action.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<DropdownMenuExample mode="light" />}
          dark={<DropdownMenuExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          the parent list and its ship submenu, printed in place. the checked row and the chosen ship keep their own
          indicator columns.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="variants" title="variants">
        <p className="st-gl-copy">
          default actions, inset words and destructive actions share the same 36 px row, 44 px on a phone. destructive
          uses key ink and the trash glyph.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuVariants />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          the trigger keeps its control ring outside. inside the list, focus stays inside the row and highlight uses the
          raised hover fill.
        </p>
        <ModePair className="st-gl-pair">
          <DropdownMenuStates />
        </ModePair>
      </Section>
    </>
  );
}
