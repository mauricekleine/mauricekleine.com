import { createFileRoute } from "@tanstack/react-router";
import { DialogLive, DialogPrinted } from "@/examples/dialog";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/dialog")({
  staticData: {
    sections: [
      { id: "modes", title: "In both modes" },
      { id: "try", title: "Try it" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Dialog"
        lede="A square sheet over a scrim, for the one decision that has to stop the page. Focus stays inside until it closes."
      >
        <InstallLine items={["dialog"]} />
      </PageHead>

      <Section id="modes" title="In both modes">
        <p className="st-c-copy">
          The sheet sits on the sheet lift over a scrim: the key at 42 percent in light, black at 60 percent in dark. In
          light a 1-bit screen prints along its contact edge. In dark there is no screen, only the shadow.
        </p>
        <p className="st-c-copy">
          Each frame below stands in for the window. The sheet centres in it the way it centres on a screen, and its
          offsets round to whole pixels, so its edges stay crisp at 1x and 2x.
        </p>
        <ModePair className="st-c-stack">
          <DialogPrinted />
        </ModePair>
        <Caption detail="contact" />
      </Section>

      <Section id="try" title="Try it">
        <p className="st-c-copy">
          This one opens for real, in the page&rsquo;s mode. Escape, the close button or a click on the scrim closes it.
          Switch the mode at the foot of the nav to see the other.
        </p>
        <div className="st-c-tools">
          <DialogLive />
        </div>
      </Section>

      <Section id="parts" title="Parts">
        <p className="st-c-copy">
          The names and props are shadcn&rsquo;s, from base-nova, on Base UI&rsquo;s dialog. Markup written for
          shadcn&rsquo;s dialog works unchanged.
        </p>
        <dl className="st-c-parts">
          <dt>
            <code>Dialog</code>
          </dt>
          <dd>
            The root. Pass <code>open</code> and <code>onOpenChange</code> to control it.
          </dd>
          <dt>
            <code>DialogTrigger</code>
          </dt>
          <dd>
            Opens it. Hand it a button through <code>render</code>.
          </dd>
          <dt>
            <code>DialogContent</code>
          </dt>
          <dd>
            The sheet, with its scrim and its close button. <code>showCloseButton=&#123;false&#125;</code> drops the
            button.
          </dd>
          <dt>
            <code>DialogHeader</code>
          </dt>
          <dd>
            Holds <code>DialogTitle</code>, in the subtitle step, and <code>DialogDescription</code>, in the muted ink.
          </dd>
          <dt>
            <code>DialogFooter</code>
          </dt>
          <dd>
            The actions: stacked on a phone, in a row from 640 px. <code>showCloseButton</code> adds a close.
          </dd>
          <dt>
            <code>DialogClose</code>
          </dt>
          <dd>
            Closes it. Hand it a button through <code>render</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
