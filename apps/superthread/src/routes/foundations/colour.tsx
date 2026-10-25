import { createFileRoute } from "@tanstack/react-router";
import { fleet } from "@/components/superthread/lib/fleet";
import { tokens } from "@/components/superthread/lib/tokens";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { inkOn, ratio } from "@/foundations/colour";
import { lineScreen, markUrl } from "@/foundations/marks";
import { hexOf, modes, recipes, spotName, type Mode } from "@/foundations/master";
import { Copy, Ink, Legend } from "@/foundations/parts";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
import { Swatch } from "@/site/Swatch";

export const Route = createFileRoute("/foundations/colour")({
  staticData: {
    sections: [
      { id: "wedge", title: "the wedge" },
      { id: "house", title: "house ink" },
      { id: "roles", title: "roles" },
      { id: "ships", title: "ship spots" },
      { id: "status", title: "statuses" },
    ],
  },
  component: Page,
});

const paper = tokens.light.background.hex;
const key = tokens.light.foreground.hex;

const strip = { light: "key over white", dark: "paper-white over key" } as const;

// one mode's wedge as a strip of its steps, each labelled in whichever of white and key reads on it
function Strip({ mode }: { mode: Mode }) {
  return (
    <figure className="st-f-strip">
      <figcaption className="type-meta">{strip[mode]}</figcaption>
      <ol>
        {tokens.wedge[mode].map(({ step, hex }) => (
          <li key={step} style={{ background: hex, color: inkOn(hex, paper, key) }}>
            <b>{step}</b>
            <span>{hex}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const houseRoles = ["primary", "primary-hover", "primary-press", "accent", "selection", "ring"] as const;
const pressed = [
  { label: "rest", demo: undefined },
  { label: "hover", demo: "hover" },
  { label: "pressed", demo: "active" },
] as const;

function House({ mode }: { mode: Mode }) {
  const ink = tokens[mode];
  return (
    <>
      <ul className="st-f-swatches">
        {houseRoles.map((role) => (
          <li key={role}>
            <Swatch color={`var(--${role})`} name={role} value={ink[role].hex} />
          </li>
        ))}
      </ul>
      <dl className="st-f-ratios">
        <div>
          <dt>label on primary</dt>
          <dd>{ratio(ink["primary-foreground"].hex, ink.primary.hex)}:1</dd>
        </div>
        <div>
          <dt>primary on the page</dt>
          <dd>{ratio(ink.primary.hex, ink.background.hex)}:1</dd>
        </div>
      </dl>
      <ul className="st-f-states-row">
        {pressed.map(({ label, demo }) => (
          <li key={label}>
            <Button data-demo={demo} tabIndex={-1}>
              save
            </Button>
            <span className="type-meta">{label}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Ships({ mode }: { mode: Mode }) {
  return (
    <ul className="st-f-ships">
      {fleet.map((ship) => (
        <li key={ship.id}>
          <img src={markUrl(ship.id, mode)} alt="" width={16} height={16} />
          <span className="st-f-ship-name">
            <b>{ship.name}</b>
            <small>
              {spotName(ship.id)} · {ship.angle}°
            </small>
          </span>
          <span className="st-f-ship-inks">
            <i style={{ background: `var(--ship-${ship.id})` }} aria-hidden="true" />
            <i className={lineScreen[ship.id]} aria-hidden="true" />
            <code>{tokens.ships[ship.id][mode].hex}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

const states = ["done", "running", "waiting", "failed", "queued"] as const;

function States({ mode }: { mode: Mode }) {
  return (
    <ul className="st-f-status">
      {states.map((state) => {
        const status = tokens.status[state];
        const ink = status[mode];
        return (
          <li key={state}>
            <div className="st-f-status-head">
              <Badge variant={state} />
              <small>
                {status.role} · {status.glyph}
              </small>
            </div>
            <dl>
              {state === "failed" ? (
                <>
                  <div>
                    <dt>solid</dt>
                    <dd>
                      <Ink
                        hex={tokens[mode]["error-solid"].hex}
                        note={`label ${ratio(tokens[mode]["error-solid-foreground"].hex, tokens[mode]["error-solid"].hex)}:1`}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>glyph</dt>
                    <dd>
                      <Ink
                        hex={ink.glyph.hex}
                        note={`on the page ${ratio(ink.glyph.hex, tokens[mode].background.hex)}:1`}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>word</dt>
                    <dd>
                      <Ink
                        hex={ink.text.hex}
                        note={`on the page ${ratio(ink.text.hex, tokens[mode].background.hex)}:1`}
                      />
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>glyph</dt>
                    <dd>
                      <Ink hex={ink.glyph.hex} note={`${ratio(ink.glyph.hex, ink.fill.hex)}:1`} />
                    </dd>
                  </div>
                  <div>
                    <dt>word</dt>
                    <dd>
                      <Ink hex={ink.text.hex} note={`${ratio(ink.text.hex, ink.fill.hex)}:1`} />
                    </dd>
                  </div>
                  <div>
                    <dt>fill</dt>
                    <dd>
                      <Ink hex={ink.fill.hex} />
                    </dd>
                  </div>
                  <div>
                    <dt>edge</dt>
                    <dd>
                      <Ink hex={ink.edge.hex} />
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

function Page() {
  const roles = Object.keys(recipes.light);
  return (
    <>
      <PageHead
        title="colour"
        lede="one key ink on white stock, and plum for everything you act on. each ship keeps one bright spot for its mark and its chart series, and five status inks name the state of a run."
      />

      <Section id="wedge" title="the wedge">
        <Copy>
          every neutral is the key ink printed as a tint over the stock: light prints key over white, dark prints
          paper-white over key. each neutral role sits on one step, and the step is how much ink it carries.
        </Copy>
        <div className="st-f-strips">
          {modes.map((mode) => (
            <Strip key={mode} mode={mode} />
          ))}
        </div>
      </Section>

      <Section id="house" title="house ink">
        <Copy>
          plum is the only control colour, on this site and inside every ship: primary actions, links, the focus ring,
          the current item, selection and the progress fill. hover and press take a step of their own in each mode.
        </Copy>
        <ModePair light={<House mode="light" />} dark={<House mode="dark" />} />
      </Section>

      <Section id="roles" title="roles">
        <Copy>
          shadcn's roles plus the system's own, each with the step or ink it is mixed from. key and paper are the wedge,
          house is plum, and the status roles borrow a state's ink.
        </Copy>
        <div className="st-f-scroll">
          <table className="st-f-table st-f-roles">
            <thead>
              <tr>
                <th scope="col">role</th>
                {modes.map((mode) => (
                  <th key={mode} scope="col">
                    {mode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role}>
                  <th scope="row">{role}</th>
                  {modes.map((mode) => (
                    <td key={mode}>
                      <Ink hex={hexOf(mode, role)} note={recipes[mode][role]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="ships" title="ship spots">
        <Copy>
          a ship's spot is its identity, never a control. it fills the one dithered region of the ship's mark and the
          ship's series in a chart, where a line screen at the ship's own angle keeps the series apart without colour.
        </Copy>
        <Legend>spot, line screen, hex</Legend>
        <ModePair light={<Ships mode="light" />} dark={<Ships mode="dark" />} />
      </Section>

      <Section id="status" title="statuses">
        <Copy>
          one vocabulary everywhere: done, running, waiting, failed and queued. a badge prints a fill close to the
          stock, an edge at about half strength, a glyph square and the word, so a state never rests on colour alone.
          glyphs clear 3:1 and words 4.5:1 on their fill. failed is the one solid badge.
        </Copy>
        <ModePair light={<States mode="light" />} dark={<States mode="dark" />} />
      </Section>
    </>
  );
}
