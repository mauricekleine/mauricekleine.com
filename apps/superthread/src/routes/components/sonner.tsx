import { createFileRoute } from "@tanstack/react-router";
import { SonnerExample, SonnerKinds, SonnerOnPhone, SonnerOpen, SonnerStates } from "@/examples/sonner";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sonner")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "kinds", title: "Kinds" },
      { id: "states", title: "States" },
      { id: "phone", title: "On a phone" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Sonner"
        lede="Notifications on the leaf lift, through Sonner's toast API. Each kind keeps its status glyph beside a title and a short explanation."
      >
        <InstallLine items={["sonner"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Show a notification below. Loading resolves to success, every live toast can close, and dismiss all clears
          this pane.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerExample mode="light" />} dark={<SonnerExample mode="dark" />} />
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          A published chapter with a small action, an outline cancel and a named close control. The persistent print
          stays within its own space.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerOpen mode="light" />} dark={<SonnerOpen mode="dark" />} />
        <Caption detail="contact" />
      </Section>
      <Section id="kinds" title="Kinds">
        <p className="st-gl-copy">
          Plain carries words alone. Success, info, warning, error and loading add their glyph; loading uses a static
          running mark.
        </p>
        <ModePair className="st-gl-pair" light={<SonnerKinds mode="light" />} dark={<SonnerKinds mode="dark" />} />
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          Actions keep the small button states. The toast owns the contact detail, so disabled actions keep a flat edge.
        </p>
        <ModePair className="st-gl-pair">
          <SonnerStates />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-gl-copy">
          <code>position</code> places the stack above 600 px, at the bottom right by default. On a phone it takes the
          toast&rsquo;s place whatever <code>position</code> says: it drops from the top of the window, 12 px inside its
          edges, clear of the send bar at the page&rsquo;s foot. A swipe up or right dismisses it. Both frames use a 390
          px viewport.
        </p>
        <ModePair light={<SonnerOnPhone mode="light" />} dark={<SonnerOnPhone mode="dark" />} />
      </Section>
    </>
  );
}
