import { createFileRoute } from "@tanstack/react-router";
import { tokens } from "@/components/superthread/lib/tokens";
import { cn } from "@/components/superthread/lib/utils";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Input } from "@/components/superthread/ui/input";
import type { Mode } from "@/foundations/master";
import { Copy } from "@/foundations/parts";
import { breakpoints } from "@/site/layout";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/space")({
  staticData: {
    sections: [
      { id: "scale", title: "scale" },
      { id: "rows", title: "rows" },
      { id: "breakpoints", title: "breakpoints" },
      { id: "shape", title: "shape" },
      { id: "elevation", title: "elevation" },
    ],
  },
  component: Page,
});

const rowHeight = {
  board: "var(--spacing-row-board)",
  table: "var(--spacing-row-table)",
  nav: "var(--spacing-row-nav)",
} as const satisfies Record<keyof typeof tokens.space.rows, string>;

const rowUse: Record<keyof typeof tokens.space.rows, string> = {
  board: "a board's rows",
  table: "a table's rows",
  nav: "a nav item",
};

const breakpointUse: Record<keyof typeof breakpoints, string> = {
  wide: "the masthead and the aside tighten",
  aside: "the aside drops below the page",
  bar: "the nav moves into the top bar and mode pairs stack",
  phone: "the phone type sizes and plates take over",
};

type Lift = keyof typeof tokens.shadow.elevation;
const lifts = Object.keys(tokens.shadow.elevation) as Lift[];

// each lift's shadow and, for the screened contact edge, its soft rake alone; written out for Tailwind
const shadow = {
  slip: "shadow-slip",
  leaf: "shadow-leaf",
  sheet: "shadow-sheet",
  lifted: "shadow-lifted",
} as const satisfies Record<Lift, string>;
const rake = {
  slip: "[--contact-lift:var(--elevation-slip-rake)]",
  leaf: "[--contact-lift:var(--elevation-leaf-rake)]",
  sheet: "[--contact-lift:var(--elevation-sheet-rake)]",
  lifted: "[--contact-lift:var(--elevation-lifted-rake)]",
} as const satisfies Record<Lift, string>;

// a lift's geometry: the rake's offsets, blur and spread, without its ink
const geometry = (lift: Lift) => tokens.shadow.elevation[lift].rake.split(" ").slice(0, 4).join(" ");

const bands: readonly { mode: Mode; ground: boolean; label: string }[] = [
  { mode: "light", ground: false, label: "light · on stock" },
  { mode: "light", ground: true, label: "light · on the deep ground" },
  { mode: "dark", ground: false, label: "dark · on stock" },
  { mode: "dark", ground: true, label: "dark · on the deep ground" },
];

function Band({ mode, ground, label }: { mode: Mode; ground: boolean; label: string }) {
  // the contact edge is screened only on stock in light; everywhere else the layer keeps its soft contact
  const screened = mode === "light" && !ground;
  return (
    <div className={cn(mode, "st-f-band")} data-ground={ground || undefined}>
      <p className="type-meta">{label}</p>
      <ul className="st-f-lifts">
        {lifts.map((lift) => (
          <li key={lift} className={cn("st-f-lift", shadow[lift], !ground && cn("texture-contact", rake[lift]))}>
            <b>{lift}</b>
            <code>{geometry(lift)}</code>
            <small>{screened ? "contact screened" : "soft contact"}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Focus() {
  return (
    <div className="st-f-focus">
      <figure>
        <Checkbox defaultChecked data-demo="focus-visible" aria-label="control focus" tabIndex={-1} />
        <figcaption className="type-meta">control</figcaption>
      </figure>
      <figure>
        <Input defaultValue="orbit" data-demo="focus" aria-label="field focus" tabIndex={-1} readOnly />
        <figcaption className="type-meta">field</figcaption>
      </figure>
    </div>
  );
}

function Page() {
  const contact = tokens.texture.contact;
  return (
    <>
      <PageHead
        title="space"
        lede={`a ${tokens.space.base} px base, square corners and 1 px edges. layers lift under one light from the upper left, and in light their contact edge prints as a screen.`}
      />

      <Section id="scale" title="scale">
        <Copy>every gap, padding and size is a step on the {tokens.space.base} px base.</Copy>
        <ol className="st-f-scale">
          {tokens.space.steps.map((step) => (
            <li key={step}>
              <code>{step}</code>
              <i style={{ width: step, height: Math.min(step, 16) }} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </Section>

      <Section id="rows" title="rows">
        <Copy>three row heights, each with a 1 px rule under it.</Copy>
        <ul className="st-f-rows">
          {(Object.keys(rowHeight) as (keyof typeof rowHeight)[]).map((row) => (
            <li key={row} style={{ height: rowHeight[row] }}>
              <b>{row}</b>
              <span>{rowUse[row]}</span>
              <code>{tokens.space.rows[row]} px</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="breakpoints" title="breakpoints">
        <Copy>four widths where the layout changes, each a max-width.</Copy>
        <table className="st-f-table st-f-breaks">
          <thead>
            <tr>
              <th scope="col">width</th>
              <th scope="col">what changes</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(breakpoints) as (keyof typeof breakpoints)[]).map((name) => (
              <tr key={name}>
                <th scope="row">
                  <code>{breakpoints[name]} px</code>
                </th>
                <td>{breakpointUse[name]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="shape" title="shape">
        <Copy>
          no radius anywhere: every corner is square and every edge is 1 px. a control shows focus as a 2 px ring in
          plum, 2 px outside it. a field thickens its own edge to 2 px inside, so focus never draws a second frame.
        </Copy>
        <ModePair>
          <Focus />
        </ModePair>
      </Section>

      <Section id="elevation" title="elevation">
        <Copy>
          one light from the upper left, so shadows fall right and down and grow with the lift. in light, on stock, a
          layer's contact edge prints as a {tokens.texture.levels.b50} percent screen, {contact.x} right and {contact.y}{" "}
          below. in dark the shadow is black and heavier, the contact stays soft, and a 1 px raised edge draws the
          layer's frame.
        </Copy>
        <div className="st-f-bands">
          {bands.map((band) => (
            <Band key={band.label} {...band} />
          ))}
        </div>
      </Section>
    </>
  );
}
