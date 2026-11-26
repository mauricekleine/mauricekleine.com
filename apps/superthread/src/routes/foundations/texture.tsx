import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { fleet } from "@/components/superthread/lib/fleet";
import { tokens } from "@/components/superthread/lib/tokens";
import { Button } from "@/components/superthread/ui/button";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Input } from "@/components/superthread/ui/input";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { Skeleton } from "@/components/superthread/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { lineScreen, markUrl } from "@/foundations/marks";
import type { Mode } from "@/foundations/master";
import { Copy, Legend } from "@/foundations/parts";
import { Caption, type DetailKey } from "@/site/Caption";
import { CropMarks } from "@/site/CropMarks";
import { ModePair } from "@/site/ModePair";
import { Plate, plate } from "@/site/Plate";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/texture")({
  staticData: {
    openerLede: "A dot screen for fields and 1 px tiles for component details.",
    sections: [
      { id: "rule", title: "The rule" },
      { id: "places", title: "Field specimens" },
      { id: "screens", title: "Screens" },
      { id: "details", title: "Component details" },
    ],
  },
  component: Page,
});

const sentence = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// a screened plate inside its crop marks, 10 px ticks set 16 px outside each corner. The box is the plate's own
// width (the phone plate's at 600 px and below) or the pane's, whichever is narrower, so the marks hold the field.
function Screened({ name, phone, width, height }: { name: string; phone: string; width: number; height: number }) {
  const style = {
    "--crop-w": `${plate(name)?.w ?? width}px`,
    "--crop-phone-w": `${plate(phone)?.w ?? width}px`,
  } as CSSProperties;
  return (
    <div className="st-f-cropped" style={style}>
      <Plate name={name} phone={phone} width={width} height={height} />
      <CropMarks />
    </div>
  );
}

function LineScreens() {
  return (
    <ul className="st-f-lines">
      {fleet.map((ship) => (
        <li key={ship.id}>
          <i className={lineScreen[ship.id]} aria-hidden="true" />
          <span>{ship.name}</span>
          <code>{ship.angle}°</code>
        </li>
      ))}
    </ul>
  );
}

function Marks({ mode }: { mode: Mode }) {
  return (
    <ul className="st-f-marks-row">
      {fleet.map((ship) => (
        <li key={ship.id}>
          <img src={markUrl(ship.id, mode)} alt={ship.name} width={32} height={32} />
        </li>
      ))}
    </ul>
  );
}

// each place by the name tokens.ts gives it, before its note in parentheses
const placeSpecimen: Record<string, (mode: Mode) => ReactNode> = {
  opener: () => <Screened name="band" phone="band-phone" width={696} height={160} />,
  figures: () => (
    <>
      <Screened name="figure" phone="figure-phone" width={520} height={150} />
      <LineScreens />
    </>
  ),
  marks: (mode) => <Marks mode={mode} />,
  "state fields": () => (
    <Progress value={62} className="st-f-progress">
      <ProgressLabel>Deploying Orbit</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
  "empty and loading places": () => <Screened name="empty" phone="empty-phone" width={608} height={120} />,
};

const places = tokens.texture.places.map((place) => {
  const open = place.indexOf(" (");
  return open < 0 ? { name: place, note: "" } : { name: place.slice(0, open), note: place.slice(open + 2, -1) };
});

// the ordered dither for component details: a pixel prints where its number is below the level, in sixteenths
const bayer = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const levels = [
  { key: "b50", className: "st-f-level st-f-b50" },
  { key: "b19", className: "st-f-level st-f-b19" },
] as const satisfies readonly { key: keyof typeof tokens.texture.levels; className: string }[];

function Screens() {
  return (
    <>
      <Legend>Chart hatches</Legend>
      <LineScreens />
      <Legend>Levels</Legend>
      <ul className="st-f-levels">
        {levels.map(({ key, className }) => (
          <li key={key}>
            <i className={className} aria-hidden="true" />
            <code>{tokens.texture.levels[key]} percent</code>
          </li>
        ))}
      </ul>
    </>
  );
}

const runs = [
  { id: "7f3a2c", ship: "Orbit", time: "00:04:12" },
  { id: "b81e07", ship: "Quanta", time: "00:01:38" },
  { id: "4c9d51", ship: "Trisys", time: "00:12:05" },
] as const;

// one live specimen per component detail; the record's type makes every detail in the tokens need one
const detailSpecimen: Record<DetailKey, ReactNode> = {
  contact: (
    <div className="st-f-layer border border-border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]">
      <ul>
        <li>Orbit</li>
        <li>Quanta</li>
        <li>Trisys</li>
      </ul>
    </div>
  ),
  mixed: (
    <div className="st-f-checks">
      <label>
        <Checkbox />
        None
      </label>
      <label>
        <Checkbox indeterminate />
        Some
      </label>
      <label>
        <Checkbox defaultChecked />
        All
      </label>
    </div>
  ),
  tabhover: (
    <Tabs defaultValue="board">
      <TabsList>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="runs" data-demo="hover">
          Runs
        </TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  rowedge: (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead kind="id">Run</TableHead>
          <TableHead>Ship</TableHead>
          <TableHead kind="number">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run, index) => (
          <TableRow
            key={run.id}
            data-demo={index === 1 ? "hover" : undefined}
            data-state={index === 2 ? "selected" : undefined}
          >
            <TableCell kind="id">{run.id}</TableCell>
            <TableCell>{run.ship}</TableCell>
            <TableCell kind="number">{run.time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  disabled: (
    <div className="st-f-disabled">
      <Button disabled>Deploy</Button>
      <div className="st-f-field">
        <Input disabled placeholder="Ship name" aria-label="Ship name" />
      </div>
    </div>
  ),
  skeleton: (
    <div className="st-f-skeleton" aria-hidden="true">
      <Skeleton style={{ width: 240 }} />
      <Skeleton style={{ width: 176 }} />
      <Skeleton style={{ width: 208 }} />
    </div>
  ),
};

// which state each specimen prints beyond rest, so the reader knows what to look at
const detailNote: Record<DetailKey, string> = {
  contact: "A select list, open",
  mixed: "None, some and all",
  tabhover: "Runs, under the pointer",
  rowedge: "The second row under the pointer, the third selected",
  disabled: "A button and a field, both disabled",
  skeleton: "Three rows loading",
};

function Page() {
  return (
    <>
      <Section id="rule" title="The rule">
        <Copy>
          Fields print round dots every 3.5 CSS px for proof plates (and 4 CSS px on legacy bands), at 45° for the first
          ink and 15° for plum. They sit beside words, numbers, data and code. A component takes at most one small
          screened detail.
        </Copy>
      </Section>

      <Section id="places" title="Field specimens">
        <Copy>
          Crop marks sit 16 px outside a contained field. <a href="/components/plate">Plate</a> prints framed 3.5 px
          proof-halftone subjects and geometry with light breath for openers and documents;{" "}
          <a href="/components/weave">Weave</a> keeps the legacy solid-to-screen band.
        </Copy>
        <ol className="st-f-places">
          {places.map(({ name, note }) => (
            <li key={name}>
              <h3 className="type-title text-first">{sentence(name)}</h3>
              <p className="st-f-note">{sentence(note)}</p>
              <ModePair
                className="st-f-stack"
                light={placeSpecimen[name.toLowerCase()]?.("light")}
                dark={placeSpecimen[name.toLowerCase()]?.("dark")}
              />
            </li>
          ))}
        </ol>
      </Section>

      <Section id="screens" title="Screens">
        <Copy>
          A chart series prints in its ship&apos;s spot with 1 px lines knocked out at the ship&apos;s own angle, so two
          series part by angle as well as colour. The detail tiles print the half for an in-between state, and a light{" "}
          {tokens.texture.levels.b19} percent for loading.
        </Copy>
        <ModePair>
          <Screens />
        </ModePair>
        <figure className="st-f-bayer">
          <table>
            <tbody>
              {bayer.map((row) => (
                <tr key={row.join()}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption>
            The 4 x 4 Bayer matrix for details. A pixel prints when its number is below the level in sixteenths: 8 of 16
            for the half, 3 of 16 for {tokens.texture.levels.b19} percent.
          </figcaption>
        </figure>
      </Section>

      <Section id="details" title="Component details">
        <Copy>Each detail with its job, in both modes, on the component itself.</Copy>
        <ol className="st-f-details">
          {tokens.texture.details.map((detail) => (
            <li key={detail.key}>
              <h3 className="type-title text-first">{sentence(detail.component)}</h3>
              <Caption detail={detail.key} />
              <p className="st-f-note">{detailNote[detail.key]}</p>
              <ModePair className="st-f-detail-pair">{detailSpecimen[detail.key]}</ModePair>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
