import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "@/components/superthread/lib/utils";
import { buttonVariants } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { FleetRow } from "@/site/FleetRow";
import { InstallLine } from "@/site/InstallLine";
import { Opener } from "@/site/Opener";

export const Route = createFileRoute("/")({
  staticData: {
    sections: [
      { id: "install", title: "install" },
      { id: "fleet", title: "the fleet" },
      { id: "next", title: "next" },
    ],
  },
  component: Page,
});

// the registry's own button as a link, at the sketch's 46 px with its 15 px label set solid
const action = "h-11.5 px-5 text-summary leading-none";

// The overview's first view, as the master's sketch sets it: the opener and its wordmark, one line on what this is,
// the install patch, the fleet, then the way in.
function Page() {
  return (
    <>
      <Opener
        title="superthread"
        lede="maurice's design system as a shadcn registry: tokens for light and dark, four typefaces, a mark for every ship and the components his apps share."
      >
        <div id="install" className="st-ov-install">
          <InstallLine items={["tokens", "button"]} />
        </div>
      </Opener>
      <section id="fleet" aria-labelledby="fleet-title" className="st-ov-fleet">
        <h2 id="fleet-title" className="type-section">
          the fleet
        </h2>
        <FleetRow />
      </section>
      <nav id="next" aria-label="where to go next" className="st-ov-next">
        <div className="st-ov-next-row">
          <Link to="/install" className={cn(buttonVariants(), action)}>
            install superthread
          </Link>
          <Link to="/foundations/colour" className={cn(buttonVariants({ variant: "outline" }), action)}>
            read the foundations
          </Link>
          <Link to="/foundations/colour" className="st-ov-nextbox">
            <span className="type-meta">next</span>
            <b>
              colour: the wedge
              <Icon name="arrow" />
            </b>
          </Link>
        </div>
      </nav>
    </>
  );
}
