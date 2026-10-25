import { createFileRoute } from "@tanstack/react-router";
import { fleet } from "@/components/superthread/lib/fleet";
import { tokens } from "@/components/superthread/lib/tokens";
import { MarkChromes, MarkDrawing } from "@/foundations/Mark";
import { drawn, markBase, markFile, markUrl, tabColor, type MarkId } from "@/foundations/marks";
import { modes, spotName, type Mode } from "@/foundations/master";
import { Copy, Legend } from "@/foundations/parts";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/marks")({
  staticData: {
    sections: [
      { id: "drawings", title: "drawings" },
      { id: "home", title: "home mark" },
      { id: "dark", title: "on dark chrome" },
      { id: "files", title: "files" },
    ],
  },
  component: Page,
});

type Entry = { id: MarkId; name: string; spot: string; hex: Record<Mode, string> };

// the fleet in its order; superthread's own mark, the rail's home cell, stands apart
const ships: readonly Entry[] = fleet.map((ship) => ({
  id: ship.id,
  name: ship.name,
  spot: spotName(ship.id),
  hex: { light: tokens.ships[ship.id].light.hex, dark: tokens.ships[ship.id].dark.hex },
}));
const home: Entry = {
  id: "superthread",
  name: "superthread",
  spot: "plum",
  hex: { light: tokens.light.primary.hex, dark: tokens.dark.primary.hex },
};
const marks: readonly Entry[] = [home, ...ships];

function Drawings({ mode, list = ships }: { mode: Mode; list?: readonly Entry[] }) {
  return (
    <ul className="st-f-marks">
      {list.map((mark) => (
        <li key={mark.id}>
          <MarkDrawing
            id={mark.id}
            mode={mode}
            label={`${mark.name}'s mark${mode === "dark" ? " for dark chrome" : ""}`}
          />
          {mode === "light" && <MarkChromes id={mark.id} />}
          <b>{mark.name}</b>
          <code>
            {mark.spot} · {mark.hex[mode]}
          </code>
          {mode === "light" && <p>{drawn[mark.id]}.</p>}
        </li>
      ))}
    </ul>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="marks"
        lede="every ship has a 16 px mark: a key tile, a paper silhouette and one region in the ship's spot, dithered at 50 percent. the mark is where a ship's colour lives."
      />

      <Section id="drawings" title="drawings">
        <Copy>
          each mark is drawn on a 16 x 16 grid, shown here with every pixel as one cell. a 1 px notch cuts each corner
          of the tile, and the spot region is a 1 px checker over the silhouette. under each drawing, the real 16 px
          file on the browser's light strip, light tab, dark strip and dark tab.
        </Copy>
        <div className="light st-f-markband">
          <Legend>light · key tile, paper silhouette</Legend>
          <Drawings mode="light" />
        </div>
      </Section>

      <Section id="home" title="home mark">
        <Copy>
          superthread's own mark sits in the fleet rail's home cell and serves as this site's favicon. its spot is plum,
          the house ink, where a ship's mark carries the ship's spot.
        </Copy>
        <div className="st-f-home">
          <div className="light st-f-markband">
            <Drawings mode="light" list={[home]} />
          </div>
          <div className="dark st-f-markband">
            <Drawings mode="dark" list={[home]} />
          </div>
        </div>
      </Section>

      <Section id="dark" title="on dark chrome">
        <Copy>
          dark chrome takes the -dark drawing: tile and silhouette swap, and the spot moves to its dark value.
        </Copy>
        <div className="dark st-f-markband">
          <Legend>dark · paper tile, key silhouette</Legend>
          <Drawings mode="dark" />
        </div>
      </Section>

      <Section id="files" title="files">
        <Copy>
          the marks are plain svg under {markBase}, served to any origin and cached for a day. the fleet rail reads them
          from its markBase.
        </Copy>
        <div className="st-f-scroll">
          <table className="st-f-table st-f-files">
            <thead>
              <tr>
                <th scope="col">mark</th>
                {modes.map((mode) => (
                  <th key={mode} scope="col">
                    {mode} chrome
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => (
                <tr key={mark.id}>
                  <th scope="row">{mark.name}</th>
                  {modes.map((mode) => (
                    <td key={mode}>
                      <a href={markUrl(mark.id, mode)}>
                        <span className="st-f-tab" style={{ background: tabColor(mode) }}>
                          <img src={markUrl(mark.id, mode)} alt="" width={16} height={16} />
                        </span>
                        <code>
                          {mark.id}/{markFile(mark.id, mode)}
                        </code>
                      </a>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
