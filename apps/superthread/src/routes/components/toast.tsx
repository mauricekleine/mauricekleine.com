import { createFileRoute } from "@tanstack/react-router";
import { ToastLive, ToastOnPhone, ToastPrinted } from "@/examples/toast";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/toast")({
  staticData: {
    sections: [
      { id: "modes", title: "In both modes" },
      { id: "try", title: "Try it" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Toast"
        lede="A short note in the corner of the window: what just happened, one thing you can do about it, then it goes."
      >
        <InstallLine items={["toast"]} />
      </PageHead>

      <Section id="modes" title="In both modes">
        <p className="st-c-copy">
          Three toasts, the newest in front. The two behind peek 12 px past it, toward the middle of the window, and
          hovering the stack spreads them 12 px apart. The stack moves by whole pixels and never scales, so the screen
          on its contact edge keeps its 1 px cells.
        </p>
        <p className="st-c-copy">
          Each type prints its status glyph in its own ink: success the tick, info the i, warning the pause, error the
          cross. Loading shows the i.
        </p>
        <ModePair className="st-c-stack">
          <ToastPrinted />
        </ModePair>
        <Caption detail="contact" />
      </Section>

      <Section id="try" title="Try it">
        <p className="st-c-copy">
          These go to a real toaster at the bottom right of the window, or at its top on a phone, in the page&rsquo;s
          mode. Each one leaves after 5 seconds; hover or focus the stack to hold it. Loading waits on a promise, then
          turns into a success.
        </p>
        <ToastLive />
      </Section>

      <Section id="phone" title="On a phone">
        <p className="st-c-copy">
          At 600 px and below the stack drops from the top of the window, 12 px inside its edges and in line with the
          panel. The foot of a phone&rsquo;s page holds the thumb and the page&rsquo;s last action, as this send bar
          does, and the frame scrolls with the page, so nothing sticks at the top for a toast to cover. A swipe up or
          right dismisses it. Both frames use a 390 px viewport.
        </p>
        <ModePair light={<ToastOnPhone mode="light" />} dark={<ToastOnPhone mode="dark" />} />
      </Section>

      <Section id="parts" title="Parts">
        <p className="st-c-copy">
          Base-nova&rsquo;s toast, on Base UI&rsquo;s toast manager. Put <code>&lt;Toaster /&gt;</code> near the root
          once, then call <code>toast</code> from anywhere.
        </p>
        <dl className="st-c-parts">
          <dt>
            <code>toast.add</code>
          </dt>
          <dd>
            Shows a toast and returns its ID. It takes <code>title</code>, <code>description</code>, <code>type</code>{" "}
            and <code>actionProps</code> for its one action; <code>type</code> picks the glyph.
          </dd>
          <dt>
            <code>toast.promise</code>
          </dt>
          <dd>One toast that follows a promise, from loading to success or error.</dd>
          <dt>
            <code>toast.update</code>
          </dt>
          <dd>Changes a toast in place, by its ID.</dd>
          <dt>
            <code>toast.close</code>
          </dt>
          <dd>Closes one toast by its ID, or every toast with no ID.</dd>
          <dt>
            <code>Toaster</code>
          </dt>
          <dd>
            The stack at the bottom right of the window, or at its top on a phone. Pass <code>toastManager</code> to
            give it a manager of its own.
          </dd>
          <dt>
            <code>Toast</code>
          </dt>
          <dd>
            The parts the stack is built from, with <code>ToastContent</code>, <code>ToastTitle</code>,{" "}
            <code>ToastDescription</code>, <code>ToastAction</code> and <code>ToastClose</code>, for a stack of your own
            under <code>ToastProvider</code> and <code>ToastViewport</code>.
          </dd>
          <dt>
            <code>ToastList</code>
          </dt>
          <dd>
            The provider&rsquo;s toasts as <code>Toaster</code> prints them. Put it in a viewport of your own to show
            the stack somewhere else, as this page does above. <code>actions</code> takes each toast and returns its
            action row, so a toast can carry more than its one action: the front toast above adds a ghost{" "}
            <code>undo</code>, named in its <code>data</code>. By default the row holds the one action.
          </dd>
          <dt>
            <code>ToastIcon</code>
          </dt>
          <dd>
            The status glyph for a toast&rsquo;s <code>type</code>, for a toast you build from the parts.
          </dd>
        </dl>
      </Section>
    </>
  );
}
