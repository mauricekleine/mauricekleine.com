import { useLayoutEffect, useRef, useState } from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

const STEPS = {
  hero: "type-hero",
  headline: "type-headline",
  section: "type-section",
  long: "type-long",
};

export type FitTitleStep = keyof typeof STEPS;

// A long title loses less at a smaller step than it does to a cut, so the ladder runs down to long at every width.
const LADDER: readonly FitTitleStep[] = ["hero", "headline", "section", "long"];

// A full working panel's measure: 880 px less its two 48 px sides. Hero needs it, so a phone's title starts at headline,
// and type-hero's phone step never prints here.
const HERO_MEASURE = 784;

const CUT_END = /[\s,;:.!?…–-]+$/u;
const withCut = (words: string) => `${words.replace(CUT_END, "")}…`;

// The largest count from 1 to max that passes, or 0 when none does. A longer count never passes after a shorter one fails.
function longest(max: number, passes: (count: number) => boolean) {
  let found = 0;
  let low = 1;
  let high = max;
  while (low <= high) {
    const count = Math.floor((low + high) / 2);
    if (passes(count)) {
      found = count;
      low = count + 1;
    } else {
      high = count - 1;
    }
  }
  return found;
}

type Fit = { step: FitTitleStep; cut?: string };

// Sets the title in an unseen ruler across the box, step by step. A step fits when the whole title sits in the room with
// no word broken; only the last step may break a word, so a word too long for the box wraps anywhere instead of clipping.
// The ruler's height is the sum of its line boxes, which ignores a face's overhang. Past the last step the title cuts at
// the last word that fits with its ellipsis, or inside a first word too long to fit at all.
function measure(box: HTMLElement, title: string, steps: readonly FitTitleStep[], lines: number | undefined) {
  if (box.clientWidth === 0) return null;
  const sized = steps.filter((step) => step !== "hero" || box.clientWidth >= HERO_MEASURE);
  const ladder = sized.length > 0 ? sized : steps;
  const last = ladder.at(-1)!;
  const ruler = box.ownerDocument.createElement("span");
  ruler.style.cssText = "position:absolute;top:0;left:0;display:block;width:100%;visibility:hidden";
  box.append(ruler);
  const fits = (step: FitTitleStep, words: string) => {
    ruler.className = STEPS[step];
    ruler.style.overflowWrap = step === last ? "anywhere" : "normal";
    ruler.textContent = words;
    const room = lines === undefined ? box.clientHeight : lines * parseFloat(getComputedStyle(ruler).lineHeight);
    return ruler.offsetHeight <= room && ruler.scrollWidth <= ruler.clientWidth;
  };
  const cutTo = (words: string) => fits(last, withCut(words));
  try {
    const step = ladder.find((candidate) => fits(candidate, title));
    if (step) return { step };
    const words = title.trim().split(/\s+/);
    const first = words[0]!;
    const count = longest(words.length - 1, (n) => cutTo(words.slice(0, n).join(" ")));
    const cut =
      count > 0
        ? words.slice(0, count).join(" ")
        : first.slice(
            0,
            Math.max(
              longest(first.length, (n) => cutTo(first.slice(0, n))),
              1,
            ),
          );
    return { step: last, cut: withCut(cut) };
  } finally {
    ruler.remove();
  }
}

type FitTitleProps = Omit<useRender.ComponentProps<"h1">, "children"> & {
  children: string;
  /** The steps it may print, largest first. Hero prints only at a full panel's measure. */
  steps?: readonly FitTitleStep[];
  /** The most lines a title may take. Without it the title fills the height its box holds. */
  lines?: number;
  /** Where the whole title prints, as a plain href. */
  href?: string;
  /** The app's router link to the same place. */
  link?: useRender.ComponentProps<"a">["render"];
};

// A title that fits by measurement, so it never loses words a smaller step could hold. The box takes its height from the
// slot it sits in, or from lines. A server can't measure, so a server's print is the first step that holds at every width,
// clipped to its box; the browser fits it in a layout effect, and again when the box changes size or a face arrives. A cut
// title keeps the whole title for a screen reader and in its tooltip. Touch has no hover, so a title that can cut takes
// href or link to the page that prints it whole. The link is chrome: it underlines on hover and reaches 44 px on a phone
// by its own height.
function FitTitle({
  children,
  className,
  href,
  lines,
  link,
  ref,
  render = <h1 />,
  steps = LADDER,
  style,
  ...props
}: FitTitleProps) {
  const box = useRef<HTMLHeadingElement>(null);
  const [fit, setFit] = useState<Fit | null>(null);
  const ladder = steps.join(" ");

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    const held = ladder.split(" ") as FitTitleStep[];
    const refit = () => {
      const next = measure(element, children, held, lines);
      if (next) setFit((now) => (now?.step === next.step && now.cut === next.cut ? now : next));
    };
    refit();
    const observer = new ResizeObserver(refit);
    observer.observe(element);
    const { fonts } = element.ownerDocument;
    fonts?.addEventListener("loadingdone", refit);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener("loadingdone", refit);
    };
  }, [children, ladder, lines]);

  const step = fit?.step ?? steps.find((candidate) => candidate !== "hero") ?? steps[0]!;
  const words = fit?.cut ? (
    <>
      <span aria-hidden="true">{fit.cut}</span>
      <span className="sr-only">{children}</span>
    </>
  ) : (
    children
  );
  const linked = useRender({
    enabled: href !== undefined || link !== undefined,
    defaultTagName: "a",
    render: link,
    state: { slot: "fit-title-link" },
    props: {
      href,
      className:
        "block decoration-1 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:min-h-11",
      children: words,
    },
  });

  return useRender({
    render,
    ref: [box, ...(ref ? [ref] : [])],
    state: { slot: "fit-title", mk: "fit-title", step, cut: fit?.cut !== undefined },
    props: {
      ...props,
      title: fit?.cut === undefined ? undefined : children,
      style: lines === undefined ? style : { ...style, maxHeight: `${lines}lh` },
      className: cn(
        "relative block min-w-0 text-first text-balance [overflow-wrap:anywhere]",
        STEPS[step],
        lines === undefined && "h-full",
        !fit && "overflow-hidden",
        className,
      ),
      children: linked ?? words,
    },
  });
}

export { FitTitle };
