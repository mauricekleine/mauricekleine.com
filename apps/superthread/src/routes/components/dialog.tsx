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
      { id: "modes", title: "in both modes" },
      { id: "try", title: "try it" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="dialog"
        lede="a square sheet over a scrim, for the one decision that has to stop the page. focus stays inside until it closes."
      >
        <InstallLine items={["dialog"]} />
      </PageHead>

      <Section id="modes" title="in both modes">
        <p className="st-c-copy">
          the sheet sits on the sheet lift over a scrim: the key at 42 percent in light, black at 60 percent in dark. in
          light a 1-bit screen prints along its contact edge. in dark there is no screen, only the shadow.
        </p>
        <p className="st-c-copy">
          each frame below stands in for the window. the sheet centres in it the way it centres on a screen, and its
          offsets round to whole pixels, so its edges stay crisp at 1x and 2x.
        </p>
        <ModePair className="st-c-stack">
          <DialogPrinted />
        </ModePair>
        <Caption detail="contact" />
      </Section>

      <Section id="try" title="try it">
        <p className="st-c-copy">
          this one opens for real, in the page&rsquo;s mode. escape, the close button or a click on the scrim closes it.
          switch the mode at the foot of the nav to see the other.
        </p>
        <div className="st-c-tools">
          <DialogLive />
        </div>
      </Section>

      <Section id="parts" title="parts">
        <p className="st-c-copy">
          the names and props are shadcn&rsquo;s, from base-nova, on base ui&rsquo;s dialog. markup written for
          shadcn&rsquo;s dialog works unchanged.
        </p>
        <dl className="st-c-parts">
          <dt>
            <code>Dialog</code>
          </dt>
          <dd>
            the root. pass <code>open</code> and <code>onOpenChange</code> to control it.
          </dd>
          <dt>
            <code>DialogTrigger</code>
          </dt>
          <dd>
            opens it. hand it a button through <code>render</code>.
          </dd>
          <dt>
            <code>DialogContent</code>
          </dt>
          <dd>
            the sheet, with its scrim and its close button. <code>showCloseButton=&#123;false&#125;</code> drops the
            button.
          </dd>
          <dt>
            <code>DialogHeader</code>
          </dt>
          <dd>
            holds <code>DialogTitle</code>, in the subtitle step, and <code>DialogDescription</code>, in the muted ink.
          </dd>
          <dt>
            <code>DialogFooter</code>
          </dt>
          <dd>
            the actions: stacked on a phone, in a row from 640 px. <code>showCloseButton</code> adds a close.
          </dd>
          <dt>
            <code>DialogClose</code>
          </dt>
          <dd>
            closes it. hand it a button through <code>render</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
