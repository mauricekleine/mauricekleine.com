// The controls 2.0 adds: switch, radio group, slider, toggle, toggle group, button group and kbd. Each is a control,
// not a field: keyboard focus draws the 2 px house ring 2 px outside it, and the boxed current item marks what is on.
import { beforeAll, describe, expect, test } from "bun:test";
import { Switch } from "@/components/superthread/ui/switch";
import { CONTROL_RING, claim, detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

describe("switch", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<Switch aria-label="notify me" />),
      server(<Switch aria-label="notify me" defaultChecked />),
      server(<Switch aria-label="notify me" size="sm" defaultChecked />),
      server(<Switch aria-label="locked" disabled defaultChecked />),
      server(<Switch aria-label="required" aria-invalid />),
    );
  });

  test("carries data-slot, data-mk and its size; on is data-checked and aria-checked", () => {
    const off = one(states[0]!, "[role=switch]");
    expect(off.el.getAttribute("data-slot")).toBe("switch");
    expect(off.el.getAttribute("data-mk")).toBe("switch");
    expect(off.el.getAttribute("data-size")).toBe("default");
    const on = one(states[1]!, "[role=switch]");
    expect(on.el.hasAttribute("data-checked")).toBe(true);
    expect(on.el.getAttribute("aria-checked")).toBe("true");
    expect(one(states[2]!, "[role=switch]").el.getAttribute("data-size")).toBe("sm");
  });

  test("it is a control: the track takes the 2 px ring 2 px outside it", () => {
    expect(one(states[0]!, "[role=switch]").classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });

  test("square and solid: the track fills with the house ink on, and the thumb crosses in the label ink", () => {
    const track = one(states[1]!, "[role=switch]").classes;
    expect(track).toEqual(
      expect.arrayContaining(["border-input", "data-checked:bg-primary", "data-checked:border-primary"]),
    );
    const thumb = one(states[1]!, '[data-slot="switch-thumb"]').classes;
    expect(thumb).toEqual(expect.arrayContaining(["bg-input", "data-checked:bg-primary-foreground"]));
    expect(thumb.filter((c) => c.includes("translate-x"))).not.toHaveLength(0);
  });

  test("the thumb travels on the quick duration and the brand ease, naming what it moves", () => {
    const thumb = one(states[0]!, '[data-slot="switch-thumb"]').classes;
    expect(thumb).toEqual(
      expect.arrayContaining([
        "transition-[translate,background-color]",
        "duration-(--duration-quick)",
        "ease-(--ease-brand)",
      ]),
    );
  });

  test("names no detail, and no forbidden class in any state", () => {
    const rendered = states.flatMap(elements);
    expect(detailsUsed(rendered, "switch")).toEqual(claim("switch"));
    expect(claim("switch")).toEqual([]);
    expect(forbidden(rendered)).toEqual([]);
  });
});
