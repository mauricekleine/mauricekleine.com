import { createFileRoute } from "@tanstack/react-router";
import { ToastLive, ToastPrinted } from "@/examples/toast";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/toast")({
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
        title="toast"
        lede="a short note in the corner of the window: what just happened, one thing you can do about it, then it goes."
      >
        <InstallLine items={["toast"]} />
      </PageHead>

      <Section id="modes" title="in both modes">
        <p className="st-c-copy">
          three toasts, the newest in front. the two behind peek 12 px above it, and hovering the stack spreads them 12
          px apart. the stack moves by whole pixels and never scales, so the screen on its contact edge keeps its 1 px
          cells.
        </p>
        <p className="st-c-copy">
          each type prints its status glyph in its own ink: success the tick, info the i, warning the pause, error the
          cross. loading shows the i.
        </p>
        <ModePair className="st-c-stack">
          <ToastPrinted />
        </ModePair>
        <Caption detail="contact" />
      </Section>

      <Section id="try" title="try it">
        <p className="st-c-copy">
          these go to a real toaster in the corner of the window, in the page&rsquo;s mode. each one leaves after 5
          seconds; hover or focus the stack to hold it. loading waits on a promise, then turns into a success.
        </p>
        <ToastLive />
      </Section>

      <Section id="parts" title="parts">
        <p className="st-c-copy">
          base-nova&rsquo;s toast, on Base UI&rsquo;s toast manager. put <code>&lt;Toaster /&gt;</code> near the root
          once, then call <code>toast</code> from anywhere.
        </p>
        <dl className="st-c-parts">
          <dt>
            <code>toast.add</code>
          </dt>
          <dd>
            shows a toast and returns its id. it takes <code>title</code>, <code>description</code>, <code>type</code>{" "}
            and <code>actionProps</code> for its one action; <code>type</code> picks the glyph.
          </dd>
          <dt>
            <code>toast.promise</code>
          </dt>
          <dd>one toast that follows a promise, from loading to success or error.</dd>
          <dt>
            <code>toast.update</code>
          </dt>
          <dd>changes a toast in place, by its id.</dd>
          <dt>
            <code>toast.close</code>
          </dt>
          <dd>closes one toast by its id, or every toast with no id.</dd>
          <dt>
            <code>Toaster</code>
          </dt>
          <dd>
            the stack in the window&rsquo;s corner. pass <code>toastManager</code> to give it a manager of its own.
          </dd>
          <dt>
            <code>Toast</code>
          </dt>
          <dd>
            the parts the stack is built from, with <code>ToastContent</code>, <code>ToastTitle</code>,{" "}
            <code>ToastDescription</code>, <code>ToastAction</code> and <code>ToastClose</code>, for a stack of your own
            under <code>ToastProvider</code> and <code>ToastViewport</code>, as this page prints one above.
          </dd>
        </dl>
      </Section>
    </>
  );
}
