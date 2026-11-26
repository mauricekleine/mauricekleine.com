import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { ReaderEnd } from "@/components/superthread/blocks/reader";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { chapter, contents, quantaNav, shipLabel } from "@/mock/data";
import { PlateField, ShipMark } from "@/mock/parts";
import { ShipFrame } from "@/mock/ShipFrame";

export const Route = createFileRoute("/mock/reading")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  const current = useCurrentSection();

  return (
    <ShipFrame ship="quanta" nav={quantaNav} current="One photon">
      <div className="mock-reading">
        <AppShellPanel className="max-w-[672px] px-[72px] pb-14 [@media(max-width:600px)]:px-5 [@media(max-width:600px)]:pb-10">
          <article className="mock-sheet">
            <p className="mock-runhead">
              <ShipMark ship={chapter.ship} size={16} />
              <b>{shipLabel(chapter.ship)}</b>
              <span>
                {chapter.number} · {chapter.title}
              </span>
              <span className="mock-folio">{chapter.folio}</span>
            </p>

            <h1 id="one-photon" className="type-page">
              One photon at a time
            </h1>
            <p className="type-read">
              Send light through two narrow slits and a pattern of bright and dark bands appears on the screen behind
              them. The bands come from waves: where the two paths arrive in step they add, and where they arrive out of
              step they cancel.
            </p>
            <p className="type-read">
              Now dim the source until only one photon is in flight at a time. Each one lands as a single dot, in a
              place nobody can predict. Yet after thousands of dots the same bands build up, as if every photon had
              passed through both slits at once.
              <sup>
                <a href="#note-1" id="ref-1" aria-label="Note 1">
                  1
                </a>
              </sup>
            </p>

            <h2 id="two-paths">Two paths, one pattern</h2>
            <p className="type-read">
              Close one slit and the fine bands go. The dots still arrive one at a time, but they settle into a single
              broad glow behind the open slit. Open it again and the bands come back, dark stripes included, in places
              where light from one slit alone would have landed.
            </p>
            <p className="type-read">
              No single dot carries the pattern. It only shows once enough of them have landed, which is why the
              experiment needs patience more than it needs light.
            </p>

            <figure id="fig-7-2" className="mock-figure">
              <PlateField
                name="figure"
                phone="figure-phone"
                width={520}
                phoneWidth={326}
                height={150}
                label="Bright and dark bands built up from single photons"
              />
              <figcaption>
                <b>Fig. 7.2</b>
                The screen after many single photons: bright where the two paths add, dark where they cancel. Screened
                in key and the house ink.
              </figcaption>
            </figure>

            <footer className="mock-notes">
              <h2 id="notes" className="sr-only">
                Notes
              </h2>
              <ol>
                <li id="note-1">
                  <a href="#ref-1" aria-label="Back to the text">
                    1
                  </a>
                  Taylor ran a faint-light version in 1909 with a gas flame and smoked-glass screens; the longest
                  exposure took about three months.
                </li>
              </ol>
            </footer>

            <ReaderEnd>That&rsquo;s the chapter.</ReaderEnd>
          </article>
        </AppShellPanel>

        <aside className="mock-margin dark" aria-label="This chapter">
          <h2 className="type-meta">On this page</h2>
          <ul className="mock-contents">
            {contents.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} aria-current={item.id === current ? "location" : undefined}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          <h2 className="type-meta">{chapter.number}</h2>
          <Progress value={chapter.page.read} className="mock-meter">
            <ProgressLabel>
              Page {chapter.page.now} of {chapter.page.of}
            </ProgressLabel>
            <ProgressValue />
          </Progress>
        </aside>
      </div>
    </ShipFrame>
  );
}

// the section the reader is in: the last one whose start has passed the top third of the window
function useCurrentSection() {
  const [current, setCurrent] = useState<string>(contents[0].id);
  useEffect(() => {
    const targets = contents
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    const update = () => {
      const line = window.innerHeight / 3;
      let found: string = contents[0].id;
      for (const node of targets) if (node.getBoundingClientRect().top <= line) found = node.id;
      // At the end, an anchor may be visible without reaching the top third. Keep the section the reader chose;
      // without an anchor, the short notes section counts once the page reaches its end.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        const anchored = targets.find((node) => `#${node.id}` === window.location.hash);
        const top = anchored?.getBoundingClientRect().top;
        found =
          anchored && top !== undefined && top >= 0 && top < window.innerHeight
            ? anchored.id
            : (targets.at(-1)?.id ?? found);
      }
      setCurrent(found);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);
  return current;
}
