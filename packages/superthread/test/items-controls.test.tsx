// The controls 2.0 adds: switch, radio group, slider, toggle, toggle group, button group and kbd. Each is a control,
// not a field: keyboard focus draws the 2 px house ring 2 px outside it, and the boxed current item marks what is on.
import { beforeAll, describe, expect, test } from "bun:test";
import { act } from "react";
import { Button } from "@/components/superthread/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/superthread/ui/button-group";
import { Kbd, KbdGroup } from "@/components/superthread/ui/kbd";
import { RadioGroup, RadioGroupItem } from "@/components/superthread/ui/radio-group";
import { Slider } from "@/components/superthread/ui/slider";
import { Toggle } from "@/components/superthread/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/superthread/ui/toggle-group";
import { Switch } from "@/components/superthread/ui/switch";
import { CONTROL_RING, client, claim, detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

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

describe("radio-group", () => {
  const sample = (disabled = false) =>
    server(
      <RadioGroup defaultValue="orbit" disabled={disabled} aria-label="ship">
        <RadioGroupItem value="orbit" aria-label="orbit" />
        <RadioGroupItem value="quanta" aria-label="quanta" aria-invalid />
      </RadioGroup>,
    );

  test("choices keep a stock box, the outside ring and a centred house square", () => {
    const host = sample();
    expect(one(host, '[data-slot="radio-group"]').classes).toContain("gap-3");
    const selected = one(host, '[role="radio"][aria-checked="true"]');
    expect(selected.classes).toEqual(
      expect.arrayContaining([
        "size-[18px]",
        "border-input",
        "bg-background",
        "data-checked:border-primary",
        "aria-invalid:border-error",
        ...CONTROL_RING,
      ]),
    );
    expect(one(selected.el, '[data-slot="radio-group-indicator"] > span').classes).toEqual(
      expect.arrayContaining(["size-2", "bg-primary"]),
    );
    expect(host.querySelectorAll('[data-slot="radio-group-indicator"]')).toHaveLength(1);
  });

  test("disabled choices keep a plain faint fill and disabled edge and indicator inks", () => {
    const radio = one(sample(true), '[role="radio"][aria-checked="true"]');
    expect(radio.el.hasAttribute("data-disabled")).toBe(true);
    expect(radio.classes).toEqual(
      expect.arrayContaining([
        "data-disabled:bg-faint",
        "data-disabled:border-disabled",
        "data-disabled:data-checked:border-disabled",
      ]),
    );
    expect(one(radio.el, '[data-slot="radio-group-indicator"] > span').classes).toContain(
      "group-data-disabled/radio-group-item:bg-disabled",
    );
  });

  test("choosing another radio moves the visible square and the submitted value", async () => {
    const view = await client(
      <form>
        <RadioGroup name="ship" defaultValue="orbit">
          <RadioGroupItem value="orbit" aria-label="orbit" />
          <RadioGroupItem value="quanta" aria-label="quanta" />
        </RadioGroup>
      </form>,
    );
    try {
      await act(async () => (view.body.querySelector('[role="radio"][aria-label="quanta"]') as HTMLElement).click());
      expect(view.body.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute("aria-label")).toBe("quanta");
      expect(view.body.querySelectorAll('[data-slot="radio-group-indicator"]')).toHaveLength(1);
      expect(new FormData(view.body.querySelector("form")!).get("ship")).toBe("quanta");
    } finally {
      await view.done();
    }
  });

  test("stays square and flat in selected, invalid and disabled states", () => {
    const rendered = [sample(), sample(true)].flatMap(elements);
    expect(forbidden(rendered)).toEqual([]);
    expect(detailsUsed(rendered, "radio-group")).toEqual(claim("radio-group"));
  });
});

describe("slider", () => {
  test.each(["horizontal", "vertical"] as const)(
    "%s track is 8 px, with a solid range and 16 px control thumbs",
    (orientation) => {
      const host = server(<Slider defaultValue={[20, 80]} orientation={orientation} />);
      const track = one(host, '[data-slot="slider-track"]');
      expect(track.el.getAttribute("data-orientation")).toBe(orientation);
      expect(track.classes).toEqual(
        expect.arrayContaining(["border", "border-input", "bg-background", "data-horizontal:h-2", "data-vertical:w-2"]),
      );
      expect(one(host, '[data-slot="slider-range"]').classes).toContain("bg-primary");
      expect(host.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(2);
      expect(one(host, '[data-slot="slider-thumb"]').classes).toEqual(
        expect.arrayContaining([
          "size-4",
          "border-primary",
          "bg-background",
          "not-data-disabled:hover:bg-accent",
          "data-dragging:bg-accent",
          ...CONTROL_RING,
          "has-[input:focus-visible]:outline-2",
          "has-[input:focus-visible]:outline-offset-2",
          "has-[input:focus-visible]:outline-(--ring)",
        ]),
      );
    },
  );

  test("one scalar value produces one thumb, and array ranges retain all thumbs", () => {
    for (const value of [40, [40], [20, 80], [20, 50, 80]]) {
      for (const host of [server(<Slider value={value} />), server(<Slider defaultValue={value} />)]) {
        expect(host.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(
          Array.isArray(value) ? value.length : 1,
        );
      }
    }
  });

  test("disabled tracks, ranges and thumbs use role inks without opacity or texture", () => {
    const host = server(<Slider defaultValue={[20, 80]} disabled />);
    const track = one(host, '[data-slot="slider-track"]');
    expect(track.el.hasAttribute("data-disabled")).toBe(true);
    expect(track.classes).toEqual(expect.arrayContaining(["data-disabled:bg-faint", "data-disabled:border-disabled"]));
    expect(one(host, '[data-slot="slider-range"]').classes).toContain("data-disabled:bg-disabled");
    expect(one(host, '[data-slot="slider-thumb"]').classes).toContain("data-disabled:border-disabled");
    expect(forbidden(elements(host))).toEqual([]);
    expect(detailsUsed(elements(host), "slider")).toEqual(claim("slider"));
  });
});

describe("toggle", () => {
  test.each([
    ["default", "h-10"],
    ["sm", "h-8"],
    ["lg", "h-12"],
  ] as const)("%s matches the button height and keeps the outside control ring", (size, height) => {
    const toggle = one(server(<Toggle size={size}>bold</Toggle>), "button");
    expect(toggle.classes).toEqual(
      expect.arrayContaining([
        height,
        "text-ui",
        "font-medium",
        "border",
        ...CONTROL_RING,
        "transition-[color,background-color,border-color]",
        "duration-(--duration-instant)",
        "ease-(--ease-brand)",
      ]),
    );
  });

  test("pressed is boxed on accent stock; disabled outline keeps a faint fill", () => {
    for (const variant of ["default", "outline"] as const) {
      const host = server(
        <Toggle variant={variant} defaultPressed disabled>
          bold
        </Toggle>,
      );
      const toggle = one(host, "button");
      expect(toggle.el.getAttribute("aria-pressed")).toBe("true");
      expect(toggle.el.hasAttribute("data-pressed")).toBe(true);
      expect(toggle.classes).toEqual(
        expect.arrayContaining([
          "aria-pressed:border-primary",
          "aria-pressed:bg-accent",
          "aria-pressed:text-accent-foreground",
          "data-disabled:text-disabled",
        ]),
      );
      if (variant === "outline")
        expect(toggle.classes).toEqual(expect.arrayContaining(["border-input", "data-disabled:bg-faint"]));
      expect(forbidden(elements(host))).toEqual([]);
      expect(detailsUsed(elements(host), "toggle")).toEqual(claim("toggle"));
    }
  });
});

describe("toggle-group", () => {
  const sample = (orientation: "horizontal" | "vertical", spacing?: number) =>
    server(
      <ToggleGroup variant="outline" size="sm" orientation={orientation} spacing={spacing} defaultValue={["day"]}>
        <ToggleGroupItem value="day">day</ToggleGroupItem>
        <ToggleGroupItem value="week">week</ToggleGroupItem>
      </ToggleGroup>,
    );

  test.each(["horizontal", "vertical"] as const)(
    "%s joins by default, preserves every pressed edge and draws focus inside",
    (orientation) => {
      const host = sample(orientation);
      expect(one(host, '[data-slot="toggle-group"]').el.getAttribute("data-spacing")).toBe("0");
      const item = one(host, '[data-slot="toggle-group-item"]');
      expect(item.el.getAttribute("data-variant")).toBe("outline");
      expect(item.el.getAttribute("data-size")).toBe("sm");
      expect(item.classes).toEqual(
        expect.arrayContaining([
          "border-input",
          "h-8",
          "relative",
          "aria-pressed:z-10",
          "focus-visible:z-20",
          "focus-visible:-outline-offset-2",
          orientation === "horizontal" ? "not-first:-ml-px" : "not-first:-mt-px",
        ]),
      );
      expect(item.classes).not.toContain("focus-visible:outline-offset-2");
      expect(forbidden(elements(host))).toEqual([]);
      expect(detailsUsed(elements(host), "toggle-group")).toEqual(claim("toggle-group"));
    },
  );

  test("positive spacing keeps separate edges and the outside ring", () => {
    const host = sample("horizontal", 3);
    expect(one(host, '[data-slot="toggle-group"]').el.getAttribute("style")).toContain("--gap:3");
    const item = one(host, '[data-slot="toggle-group-item"]');
    expect(item.classes).toEqual(expect.arrayContaining(CONTROL_RING));
    expect(item.classes.some((c) => c.includes("-ml-px") || c.includes("-mt-px"))).toBe(false);
  });

  test("vertical groups pass orientation to keyboard navigation", async () => {
    const view = await client(
      <ToggleGroup orientation="vertical">
        <ToggleGroupItem value="day">day</ToggleGroupItem>
        <ToggleGroupItem value="week">week</ToggleGroupItem>
      </ToggleGroup>,
    );
    try {
      const buttons = view.body.querySelectorAll("button");
      await act(async () => {
        buttons[0]!.focus();
        buttons[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      });
      expect(document.activeElement).toBe(buttons[1]);
    } finally {
      await view.done();
    }
  });

  test("clicking a joined item moves the boxed current state", async () => {
    const view = await client(
      <ToggleGroup defaultValue={["day"]} variant="outline">
        <ToggleGroupItem value="day">day</ToggleGroupItem>
        <ToggleGroupItem value="week">week</ToggleGroupItem>
      </ToggleGroup>,
    );
    try {
      await act(async () => (view.body.querySelectorAll("button")[1] as HTMLElement).click());
      expect([...view.body.querySelectorAll('[aria-pressed="true"]')].map((el) => el.textContent)).toEqual(["week"]);
    } finally {
      await view.done();
    }
  });
});

describe("button-group", () => {
  test.each(["horizontal", "vertical"] as const)(
    "%s joins edges without removing a child's border and raises focus",
    (orientation) => {
      const host = server(
        <ButtonGroup orientation={orientation}>
          <Button variant="outline">start</Button>
          <Button variant="outline">stop</Button>
        </ButtonGroup>,
      );
      expect(one(host, '[data-slot="button-group"]').classes).toEqual(
        expect.arrayContaining([
          "*:focus-visible:relative",
          "*:focus-visible:z-10",
          orientation === "horizontal" ? "*:not-first:-ml-px" : "*:not-first:-mt-px",
        ]),
      );
      expect(forbidden(elements(host))).toEqual([]);
      expect(detailsUsed(elements(host), "button-group")).toEqual(claim("button-group"));
    },
  );

  test("addon composition keeps its slot, stock and height; separators stretch on both axes", () => {
    const host = server(
      <ButtonGroup>
        <ButtonGroupText render={<span />}>run</ButtonGroupText>
        <ButtonGroupSeparator />
        <ButtonGroupSeparator orientation="horizontal" />
      </ButtonGroup>,
    );
    const text = one(host, '[data-slot="button-group-text"]');
    expect(text.el.tagName).toBe("SPAN");
    expect(text.el.textContent).toBe("run");
    expect(text.classes).toEqual(
      expect.arrayContaining(["h-10", "px-3", "border-input", "bg-secondary", "text-ui", "text-muted-foreground"]),
    );
    for (const el of host.querySelectorAll('[data-slot="button-group-separator"]')) {
      expect(el.className.split(/\s+/)).toEqual(expect.arrayContaining(["bg-input", "self-stretch"]));
    }
  });
});

describe("kbd", () => {
  test("keycaps print mono at 11 px without caps or tracking and invert through opaque roles in tooltips", () => {
    const host = server(
      <div data-slot="tooltip-content">
        <KbdGroup>
          <Kbd>ctrl</Kbd>
          <Kbd>k</Kbd>
        </KbdGroup>
      </div>,
    );
    expect(one(host, '[data-slot="kbd"]').classes).toEqual(
      expect.arrayContaining([
        "h-5",
        "min-w-5",
        "border",
        "border-border",
        "bg-muted",
        "font-mono",
        "text-[11px]",
        "leading-none",
        "in-data-[slot=tooltip-content]:border-muted-foreground",
        "in-data-[slot=tooltip-content]:bg-foreground",
        "in-data-[slot=tooltip-content]:text-background",
      ]),
    );
    expect(one(host, '[data-slot="kbd-group"]').classes).toEqual(
      expect.arrayContaining(["inline-flex", "items-center", "gap-1"]),
    );
    expect(forbidden(elements(host))).toEqual([]);
    expect(detailsUsed(elements(host), "kbd")).toEqual(claim("kbd"));
  });
});
