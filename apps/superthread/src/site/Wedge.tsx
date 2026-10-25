import { tokens } from "@/components/superthread/lib/tokens";

// which roles sit on each step of the wedge, per mode, as the master's sketch prints them; an unnamed step is a
// print step only, struck through
const roles = {
  light: {
    100: "text, rules, code, destructive",
    98: "ground: ship surfaces",
    88: "muted text",
    78: "input edge",
    48: "disabled text",
    32: "secondary pressed",
    20: "border",
    12: "secondary",
    5: "muted, faint",
    0: "background, card, popover",
  },
  dark: {
    80: "text, destructive",
    60: "destructive hover",
    44: "muted text",
    24: "input edge",
    16: "rules",
    10: "disabled text",
    6: "secondary hover",
    4: "secondary",
    3: "border",
    1: "card, popover, muted",
    0: "background",
  },
} as const satisfies Record<"light" | "dark", Record<number, string>>;

const heading = { light: "the wedge · key on white", dark: "the wedge · paper-white on key" } as const;

function WedgeTable({ mode }: { mode: "light" | "dark" }) {
  const named: Record<number, string> = roles[mode];
  return (
    <div className={`st-wedge st-wedge-${mode}`}>
      <p className="type-meta">{heading[mode]}</p>
      <table>
        <tbody>
          {tokens.wedge[mode].map(({ step, hex }) => (
            <tr key={step}>
              <td>
                <i style={{ background: hex }} />
              </td>
              <td className="st-wedge-step">{step}</td>
              <td>{named[step] ?? <s>print step</s>}</td>
            </tr>
          ))}
          <tr>
            <td>
              <i style={{ background: tokens[mode].primary.hex }} />
            </td>
            <td className="st-wedge-step">h</td>
            <td>house: primary, ring, current</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// The aside's wedge: the key's tints on white in light, paper-white's on key in dark, each step with the roles
// that use it. Both tables are in the markup and the mode shows one, so the prerendered page is right in either.
export function Wedge() {
  return (
    <section aria-label="the wedge">
      <WedgeTable mode="light" />
      <WedgeTable mode="dark" />
    </section>
  );
}
