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
        title="command"
        lede="search and run a command from a flat list or a raised palette. the highlighted row follows the pointer or keys, while groups and shortcuts keep their place."
      >
        <InstallLine items={["command"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          type to filter, use the arrow keys to move and press enter to select. the palette opens the same commands in a
          sheet.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<CommandExample mode="light" />}
          dark={<CommandExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          the palette printed as a sheet, with its search field, grouped commands and shortcuts. the disabled build
          action stays in view.
        </p>
        <ModePair className="st-gl-pair">
          <CommandOpen />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          highlight marks the next command to run. a search with no match explains the miss, and disabled commands
          cannot be selected.
        </p>
        <ModePair className="st-gl-pair">
          <CommandStates />
        </ModePair>
      </Section>
    </>
  );
}
