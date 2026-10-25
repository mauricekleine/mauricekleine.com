import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tokens } from "@/components/superthread/lib/tokens";
import { Button } from "@/components/superthread/ui/button";
import { Copy } from "@/foundations/parts";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/motion")({
  staticData: {
    sections: [
      { id: "durations", title: "durations" },
      { id: "ease", title: "ease" },
      { id: "reduced", title: "reduced motion" },
    ],
  },
  component: Page,
});

const durations = [
  { name: "instant", use: "ink changes: buttons, tabs, table rows, the select list" },
  { name: "quick", use: "layers that appear in place: a dialog, the fleet rail, the sidebar" },
  { name: "travel", use: "anything that covers distance: a progress fill, a toast, the sidebar sliding" },
] as const satisfies readonly { name: keyof typeof tokens.motion; use: string }[];

// the four numbers inside cubic-bezier(...)
const curve = tokens.motion.ease.value
  .slice(tokens.motion.ease.value.indexOf("(") + 1, -1)
  .split(",")
  .map(Number) as [number, number, number, number];

// the ease drawn in a 160 px square: time runs right, progress runs up, the two handles in the rule ink
function Curve() {
  const size = 160;
  const [x1, y1, x2, y2] = curve;
  const at = (x: number, y: number) => `${x * size} ${(1 - y) * size}`;
  return (
    <svg
      className="st-f-curve"
      viewBox={`-8 -8 ${size + 16} ${size + 16}`}
      width={size + 16}
      height={size + 16}
      role="img"
      aria-label={`the brand ease, ${tokens.motion.ease.value}`}
    >
      <rect x="0" y="0" width={size} height={size} />
      <path className="st-f-curve-handle" d={`M${at(0, 0)}L${at(x1, y1)}M${at(1, 1)}L${at(x2, y2)}`} />
      <path className="st-f-curve-line" d={`M${at(0, 0)}C${at(x1, y1)} ${at(x2, y2)} ${at(1, 1)}`} />
      <circle cx={x1 * size} cy={(1 - y1) * size} r="3" />
      <circle cx={x2 * size} cy={(1 - y2) * size} r="3" />
    </svg>
  );
}

function Page() {
  const [played, setPlayed] = useState(false);
  return (
    <>
      <PageHead
        title="motion"
        lede="three durations and one ease. state changes are quick and settle hard, and nothing moves on its own."
      />

      <Section id="durations" title="durations">
        <Copy>press play to send each bar across its track at its own duration, all on the brand ease.</Copy>
        <div className="st-f-play">
          <Button variant="outline" size="sm" aria-pressed={played} onClick={() => setPlayed((on) => !on)}>
            {played ? "play back" : "play"}
          </Button>
        </div>
        <ul className="st-f-durations" data-played={played || undefined}>
          {durations.map(({ name, use }) => (
            <li key={name}>
              <p>
                <b>{name}</b>
                <code>{tokens.motion[name].value}</code>
              </p>
              <span className="st-f-track" aria-hidden="true">
                <i style={{ transitionDuration: `var(--duration-${name})` }} />
              </span>
              <small>{use}</small>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="ease" title="ease">
        <Copy>
          one curve for everything that moves: it leaves fast and lands soft, so a change reads at once and still
          settles.
        </Copy>
        <figure className="st-f-ease">
          <Curve />
          <figcaption>
            <code>{tokens.motion.ease.value}</code>
          </figcaption>
        </figure>
      </Section>

      <Section id="reduced" title="reduced motion">
        <Copy>
          with reduced motion on, every duration drops to zero: states still change, nothing travels. turn it on in your
          system settings and press play again to see the bars jump. screens and textures never move in either case.
        </Copy>
      </Section>
    </>
  );
}
