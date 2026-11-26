import { createFileRoute } from "@tanstack/react-router";
import { tokens } from "@/components/superthread/lib/tokens";
import { cn } from "@/components/superthread/lib/utils";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Input } from "@/components/superthread/ui/input";
import type { Mode } from "@/foundations/master";
import { Copy } from "@/foundations/parts";
import { breakpoints } from "@/site/layout";
import { ModePair } from "@/site/ModePair";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/space")({
  staticData: {
    openerLede: `A ${tokens.space.base} px base, square corners and 1 px edges. Layers lift under one light from the upper left, and in light their contact edge prints as a screen.`,
    sections: [
      { id: "scale", title: "Scale" },
      { id: "rows", title: "Rows" },
      { id: "panel-inset", title: "Panel inset" },
      { id: "breakpoints", title: "Breakpoints" },
      { id: "shape", title: "Shape" },
      { id: "elevation", title: "Elevation" },
    ],
  },
  component: Page,
});

const rowHeight = {
  board: "var(--spacing-row-board)",
  table: "var(--spacing-row-table)",
  nav: "var(--spacing-row-nav)",
  plain: "var(--spacing-row-plain)",
  nested: "var(--spacing-row-nested)",
} as const satisfies Record<keyof typeof tokens.space.rows, string>;

const rowUse: Record<keyof typeof tokens.space.rows, string> = {
  board: "A board's rows",
  table: "A table's rows",
  nav: "A nav item",
  plain: "A plain row, with no rule",
  nested: "A plain row under a section head, with no rule",
};

const breakpointUse: Record<keyof typeof breakpoints, string> = {
  wide: "The masthead and the aside tighten",
  aside: "The aside drops below the page",
  bar: "The nav moves into the top bar and mode pairs stack",
  phone: "The phone type sizes and plates take over, and every target reaches 44 px",
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
  { mode: "light", ground: false, label: "Light · on stock" },
  { mode: "light", ground: true, label: "Light · on the deep ground" },
  { mode: "dark", ground: false, label: "Dark · on stock" },
  { mode: "dark", ground: true, label: "Dark · on the deep ground" },
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
            <small>{screened ? "Contact screened" : "Soft contact"}</small>
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
        <Checkbox defaultChecked data-demo="focus-visible" aria-label="Control focus" tabIndex={-1} />
        <figcaption className="type-meta">Control</figcaption>
      </figure>
      <figure>
        <Input defaultValue="Orbit" data-demo="focus" aria-label="Field focus" tabIndex={-1} readOnly />
        <figcaption className="type-meta">Field</figcaption>
      </figure>
    </div>
  );
}

function Page() {
  const contact = tokens.texture.contact;
  return (
    <>
      <Section id="scale" title="Scale">
        <Copy>Every gap, padding and size is a step on the {tokens.space.base} px base.</Copy>
        <ol className="st-f-scale">
          {tokens.space.steps.map((step) => (
            <li key={step}>
              <code>{step}</code>
              <i style={{ width: step, height: Math.min(step, 16) }} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </Section>

      <Section id="rows" title="Rows">
        <Copy>Five row heights. The first three carry a 1 px rule under them, and the plain two carry none.</Copy>
        <ul className="st-f-rows">
          {(Object.keys(rowHeight) as (keyof typeof rowHeight)[]).map((row) => (
            <li
              key={row}
              style={{ height: rowHeight[row] }}
              data-plain={row === "plain" || row === "nested" || undefined}
            >
              <b>{row}</b>
              <span>{rowUse[row]}</span>
              <code>{tokens.space.rows[row]} px</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="panel-inset" title="Panel inset">
        <Copy>
          The working panel&rsquo;s sides: {tokens.space.panelInset.value} px, and {tokens.space.panelInset.phone} px at{" "}
          {breakpoints.phone} px and below. A row that reaches the panel&rsquo;s edges uses{" "}
          <code>-mx-panel-inset px-panel-inset</code>, so it never repeats the number.
        </Copy>
      </Section>

      <Section id="breakpoints" title="Breakpoints">
        <Copy>Four widths where the layout changes, each a max-width.</Copy>
        <table className="st-f-table st-f-breaks">
          <thead>
            <tr>
              <th scope="col">Width</th>
              <th scope="col">What changes</th>
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

      <Section id="shape" title="Shape">
        <Copy>
          No radius anywhere: every corner is square and every edge is 1 px. A control shows focus as a 2 px ring in
          plum, 2 px outside it. A field thickens its own edge to 2 px inside, so focus never draws a second frame.
        </Copy>
        <ModePair>
          <Focus />
        </ModePair>
      </Section>

      <Section id="elevation" title="Elevation">
        <Copy>
          One light from the upper left, so shadows fall right and down and grow with the lift. In light, on stock, a
          layer&apos;s contact edge prints as a {tokens.texture.levels.b50} percent screen, {contact.x} right and{" "}
          {contact.y} below. In dark the shadow is black and heavier, the contact stays soft, and a 1 px raised edge
          draws the layer&apos;s frame.
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
