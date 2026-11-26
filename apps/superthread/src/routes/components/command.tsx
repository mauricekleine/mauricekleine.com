import { createFileRoute } from "@tanstack/react-router";
import { CommandExample, CommandOpen, CommandStates } from "@/examples/command";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/command")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Command"
        lede="Search and run a command from a flat list or a raised palette. The highlighted row follows the pointer or keys, while groups and shortcuts keep their place."
      >
        <InstallLine items={["command"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Type to filter, use the arrow keys to move and press Enter to select. The palette opens the same commands in a
          sheet.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<CommandExample mode="light" />}
          dark={<CommandExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          The palette printed as a sheet, with its search field, grouped commands and shortcuts. The disabled build
          action stays in view.
        </p>
        <ModePair className="st-gl-pair">
          <CommandOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          Highlight marks the next command to run. A search with no match explains the miss, and disabled commands
          cannot be selected.
        </p>
        <ModePair className="st-gl-pair">
          <CommandStates />
        </ModePair>
      </Section>
    </>
  );
}
