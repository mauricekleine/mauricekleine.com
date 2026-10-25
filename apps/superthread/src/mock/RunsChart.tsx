import type { CSSProperties } from "react";
import { fleet } from "@/components/superthread/lib/fleet";
import { type ChartShip, series, weeks } from "./data";
import { ShipMark } from "./parts";

// Each series prints in its ship's spot with 1 px lines knocked out at the angle its mark carries, so it reads by
// colour at a glance and by angle without colour. Every segment has a 1 px outline in the foreground and a 2 px gap
// above it. The geometry is whole pixels: heights come from here, widths from mock.css, which narrows the slots on a
// narrow pane instead of scaling the drawing.
const screen: Record<ChartShip, string> = {
  orbit: "texture-line-orbit",
  constellation: "texture-line-constellation",
  quanta: "texture-line-quanta",
  artifacts: "texture-line-artifacts",
};

const PLOT = 224;
const MAX = 140;
const ticks = [0, 40, 80, 120];
const y = (runs: number) => Math.round((runs * PLOT) / MAX);
const angle = (ship: ChartShip) => fleet.find((entry) => entry.id === ship)?.angle ?? 0;

export function RunsChart() {
  const totals = weeks.map((_, week) => series.reduce((sum, line) => sum + line.runs[week], 0));
  const summary = weeks.map((week, index) => `${week} ${totals[index]}`).join(", ");

  return (
    <figure className="mock-chart">
      <div className="mock-plot" role="img" aria-label={`agent runs per week by ship: ${summary}`}>
        {ticks.map((tick) => (
          <span key={tick} className="mock-tick" data-zero={tick === 0 || undefined} style={{ bottom: y(tick) }}>
            <span>{tick}</span>
          </span>
        ))}
        {weeks.map((week, index) => {
          let below = 0;
          return (
            <div key={week} className="mock-bar" style={{ "--slot-index": index } as CSSProperties}>
              {series.map((line) => {
                const from = below;
                below += line.runs[index];
                // the segment sits a pixel above its boundary and stops 2 px short of the next one
                return (
                  <i
                    key={line.ship}
                    className="mock-segment"
                    style={{ bottom: y(from) + 1, height: y(below) - y(from) - 2 }}
                  >
                    <b className={screen[line.ship]} />
                  </i>
                );
              })}
              <span className="mock-total" style={{ bottom: y(totals[index]) + 7 }}>
                {totals[index]}
              </span>
              <span className="mock-week">{week}</span>
            </div>
          );
        })}
      </div>
      <ul className="mock-legend">
        {series.map((line) => (
          <li key={line.ship}>
            <span className="mock-chip" aria-hidden="true">
              <b className={screen[line.ship]} />
            </span>
            <ShipMark ship={line.ship} />
            <b>{line.ship}</b>
            <span className="mock-quiet">{angle(line.ship)}°</span>
            <span className="mock-quiet">{line.runs.reduce((sum, runs) => sum + runs, 0)} runs</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
