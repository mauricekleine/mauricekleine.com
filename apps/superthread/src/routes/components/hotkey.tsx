import { createFileRoute } from "@tanstack/react-router";
import { HotkeyExample } from "@/examples/hotkey";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/hotkey")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "when", title: "when it says no" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="hotkey"
        lede="one check for a bare key a page answers, so a letter never lands in a field by surprise."
      >
        <InstallLine items={["hotkey"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-pass-prose">
          <code>isPageKey(event, &quot;n&quot;)</code> takes a keydown and the key you want. call it from a listener on
          the document. <code>search-palette</code> opens on <code>/</code> through it and <code>quick-add</code>
          &rsquo;s nav field opens on <code>n</code>. press <kbd>n</kbd> on this page, then type one in the field.
        </p>
        <ModePair>
          <HotkeyExample />
        </ModePair>
      </Section>
      <Section id="when" title="when it says no">
        <p className="st-pass-prose">
          it says no in text, a textarea, a select or anything editable, and inside a dialog, a menu or a list, because
          a modal holds the page and a menu jumps to the item a letter starts. it also says no to a held key, a key with
          a modifier, a key mid-composition and a key something else already took. caps lock changes nothing.
        </p>
      </Section>
    </>
  );
}
