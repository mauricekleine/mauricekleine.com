import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "@/components/superthread/lib/utils";
import { buttonVariants } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { FleetRow } from "@/site/FleetRow";
import { InstallLine } from "@/site/InstallLine";

export const Route = createFileRoute("/")({
  staticData: {
    openerLede:
      "Maurice's design system as a shadcn registry: tokens for light and dark, four typefaces, a mark for every ship and the components his apps share.",
    sections: [
      { id: "install", title: "Install" },
      { id: "fleet", title: "The fleet" },
      { id: "next", title: "Next" },
    ],
  },
  component: Page,
});

// the registry's own button as a link, at the sketch's 46 px with its 15 px label set solid
const action = "h-11.5 px-5 text-summary leading-none";

// The overview starts with the install line below the opener, followed by the fleet and the way in.
function Page() {
  return (
    <>
      <div id="install">
        <InstallLine items={["tokens", "button"]} />
      </div>
      <section id="fleet" aria-labelledby="fleet-title" className="st-ov-fleet">
        <h2 id="fleet-title" className="type-section text-first">
          The fleet
        </h2>
        <FleetRow />
      </section>
      <nav id="next" aria-label="Where to go next" className="st-ov-next">
        <div className="st-ov-next-row">
          <Link to="/install" className={cn(buttonVariants(), action)}>
            Install Superthread
          </Link>
          <Link to="/foundations/colour" className={cn(buttonVariants({ variant: "outline" }), action)}>
            Read the foundations
          </Link>
          <Link to="/foundations/colour" className="st-ov-nextbox">
            <span className="type-meta">Next</span>
            <b>
              Colour: the wedge
              <Icon name="arrow" />
            </b>
          </Link>
        </div>
      </nav>
    </>
  );
}
