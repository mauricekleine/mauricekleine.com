import { tokens } from "@/components/superthread/lib/tokens";

// Which roles sit on each step of the wedge, per mode, as the master's sketch prints them; an unnamed step is a
// print step only, labelled in an <s> that shell.css sets in the muted ink.
const roles = {
  light: {
    100: "Text, rules, code, destructive",
    98: "Ground: ship surfaces",
    88: "Muted text",
    78: "Input edge",
    48: "Disabled text",
    32: "Secondary pressed",
    20: "Border",
    12: "Secondary",
    5: "Muted, faint",
    0: "Background, card, popover",
  },
  dark: {
    80: "Text, destructive",
    60: "Destructive hover",
    44: "Muted text",
    24: "Input edge",
    16: "Rules",
    10: "Disabled text",
    6: "Secondary hover",
    4: "Secondary",
    3: "Border",
    1: "Card, popover, muted",
    0: "Background",
  },
} as const satisfies Record<"light" | "dark", Record<number, string>>;

const heading = { light: "The wedge · key on white", dark: "The wedge · paper-white on key" } as const;

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
              <td>{named[step] ?? <s>Print step</s>}</td>
            </tr>
          ))}
          <tr>
            <td>
              <i style={{ background: tokens[mode].primary.hex }} />
            </td>
            <td className="st-wedge-step">H</td>
            <td>House: primary, ring</td>
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
    <section aria-label="The wedge">
      <WedgeTable mode="light" />
      <WedgeTable mode="dark" />
    </section>
  );
}
