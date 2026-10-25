import { createFileRoute } from "@tanstack/react-router";
import { SonnerExample, SonnerKinds, SonnerOpen, SonnerStates } from "@/examples/sonner";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sonner")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "kinds", title: "kinds" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="sonner"
        lede="notifications on the leaf lift, through sonner's toast api. each kind keeps its status glyph beside a title and a short explanation."
      >
        <InstallLine items={["sonner"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          show a notification below. loading resolves to success, every live toast can close, and dismiss all clears
          this pane.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerExample mode="light" />} dark={<SonnerExample mode="dark" />} />
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          a published chapter with a small action, an outline cancel and a named close control. the persistent print
          stays within its own space.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerOpen mode="light" />} dark={<SonnerOpen mode="dark" />} />
        <Caption detail="contact" />
      </Section>
      <Section id="kinds" title="kinds">
        <p className="st-gl-copy">
          plain carries words alone. success, info, warning, error and loading add their glyph; loading uses a static
          running mark.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerKinds mode="light" />} dark={<SonnerKinds mode="dark" />} />
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          actions keep the small button states. the toast owns the contact detail, so disabled actions keep a flat edge.
        </p>
        <ModePair className="st-gl-pair">
          <SonnerStates />
        </ModePair>
      </Section>
    </>
  );
}
