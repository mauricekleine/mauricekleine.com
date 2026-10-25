import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ComponentProps, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { FieldErrorGlyph } from "@/components/superthread/ui/glyphs";
import { Input } from "@/components/superthread/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/superthread/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/superthread/ui/select";
import { Textarea } from "@/components/superthread/ui/textarea";
import { catalog } from "../items/catalog.ts";

// The fields: steer 4's one focus state for every field (GATE.md, "the field focus rule"), the texture each item
// claims, and the classes no field may carry. The select popup is portaled, so it renders through react-dom/client
// into happy-dom (GATE.md build ruling 5); everything else renders with renderToString. The package's test preload
// owns the DOM and act()'s globals: it registers happy-dom before any test file loads, because Base UI picks its
// layout effect on import by whether a document exists, and Bun shares that module across files. This file
// registers nothing; it cleans up each render it mounts.

const root = join(import.meta.dir, "..");
const details = JSON.parse(readFileSync(join(root, "tokens/details.json"), "utf8")) as { DETAILS: { key: string }[] };
const DETAIL_UTILITIES = new Set(details.DETAILS.map((d) => `texture-${d.key}`));
const css = readFileSync(join(root, "dist/v2/superthread.css"), "utf8");

// A class split at its top-level colons: the variants, then the utility (`-` and `!` stripped).
function parts(cls: string): { variants: string[]; utility: string } {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) {
      segments.push(cls.slice(start, i));
      start = i + 1;
    }
  }
  const last = cls.slice(start);
  return { variants: segments, utility: last.replace(/^!/, "").replace(/!$/, "").replace(/^-/, "") };
}

type Rendered = { el: Element; classes: string[] };

function elements(scope: ParentNode): Rendered[] {
  return [...scope.querySelectorAll("[class]")].map((el) => ({
    el,
    classes: (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean),
  }));
}

// Server-rendered markup, parsed back into a DOM so it can be queried.
function server(node: ReactNode): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToString(node);
  return host;
}

// A client render into document.body, for the portaled select popup. Returns the body and a cleanup.
async function client(node: ReactNode): Promise<{ body: HTMLElement; done: () => Promise<void> }> {
  const host = document.createElement("div");
  document.body.append(host);
  const reactRoot = createRoot(host);
  await act(async () => reactRoot.render(node));
  return {
    body: document.body,
    done: async () => {
      await act(async () => reactRoot.unmount());
      host.remove();
    },
  };
}

function one(scope: ParentNode, selector: string): Rendered {
  const el = scope.querySelector(selector);
  expect(el, selector).not.toBeNull();
  return { el: el!, classes: (el!.getAttribute("class") ?? "").split(/\s+/).filter(Boolean) };
}

// No field draws focus with :focus-within (it would frame the box for a button inside it), and none carries a class
// that nulls or replaces the outline: outline-none and outline-hidden set outline-style none, which outline-2 reads
// (GATE.md build ruling 2), and base-nova's rings come off. No dark: class either; the tokens carry the mode.
// (Transitions that would fade a ring are checked for every shipped item in items-layers.test.tsx.)
function forbidden(rendered: Rendered[]): string[] {
  const hits: string[] = [];
  for (const { el, classes } of rendered)
    for (const cls of classes) {
      const { variants, utility } = parts(cls);
      const why =
        utility === "outline-none" || utility === "outline-hidden"
          ? "nulls the outline"
          : /^ring(-|$)/.test(utility)
            ? "a ring"
            : variants.some((v) => v.includes("focus-within"))
              ? "focus-within"
              : variants.includes("dark")
                ? "a dark: class"
                : null;
      if (why) hits.push(`${el.getAttribute("data-slot") ?? el.tagName}: ${cls} (${why})`);
    }
  return hits;
}

// The item's own elements: those outside any descendant that carries another item's data-mk. A nested item (the
// button inside an input-group) brings its own detail, so its classes never count against the item holding it.
function own(rendered: Rendered[], item: string): Rendered[] {
  return rendered.filter(({ el }) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      const mk = node.getAttribute("data-mk");
      if (mk !== null && mk !== item) return false;
    }
    return true;
  });
}

// The component-detail utilities (texture-<DETAILS key>) the item's own elements use. The five places' utilities
// (texture-ramp, texture-line-<ship>) are not DETAILS keys, so they never count.
function detailsUsed(rendered: Rendered[], item: string): string[] {
  const used = new Set<string>();
  for (const { classes } of own(rendered, item))
    for (const cls of classes) {
      const { utility } = parts(cls);
      if (DETAIL_UTILITIES.has(utility)) used.add(utility);
    }
  return [...used].sort();
}

function claim(name: string): string[] {
  const item = catalog.find((entry) => entry.name === name);
  expect(item, name).toBeDefined();
  return item!.texture ? [`texture-${item!.texture}`] : [];
}

// The edge a box draws while it is its own focused control (GATE.md: border and a 2 px outline at -2 px in --fx).
const SELF_EDGE = ["focus:border-(--fx)", "focus:outline-2", "focus:-outline-offset-2", "focus:outline-(--fx)"];
const FX_PRIMARY = "[--fx:var(--primary)]";

const ships = ["orbit", "quanta", "trisys"];

function SelectSpecimen(props: {
  open?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  content?: Omit<ComponentProps<typeof SelectContent>, "children">;
}) {
  return (
    <Select defaultValue="trisys" open={props.open} disabled={props.disabled}>
      <SelectTrigger aria-label="ship" aria-invalid={props.invalid || undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent {...props.content}>
        <SelectGroup>
          <SelectLabel>ships</SelectLabel>
          {ships.map((ship) => (
            <SelectItem key={ship} value={ship}>
              {ship}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("input", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<Input placeholder="a ship name" />),
      server(<Input defaultValue="no such ship" aria-invalid />),
      server(<Input disabled defaultValue="7" />),
    );
  });

  test("carries data-slot and data-mk; an invalid input carries aria-invalid", () => {
    const rest = one(states[0]!, "input");
    expect(rest.el.getAttribute("data-slot")).toBe("input");
    expect(rest.el.getAttribute("data-mk")).toBe("input");
    expect(one(states[1]!, "input").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("the box is its own control: focus draws its edge, the caret takes --fx, and --fx turns to the error ink", () => {
    const { classes } = one(states[0]!, "input");
    expect(classes).toEqual(expect.arrayContaining([...SELF_EDGE, "caret-(--fx)", FX_PRIMARY]));
    expect(classes).toEqual(expect.arrayContaining(["aria-invalid:[--fx:var(--error)]", "aria-invalid:border-error"]));
  });

  test("carries only texture-disabled, and no forbidden class in any state", () => {
    const rendered = states.flatMap(elements);
    expect(detailsUsed(rendered, "input")).toEqual(claim("input"));
    expect(claim("input")).toEqual(["texture-disabled"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

describe("textarea", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<Textarea placeholder="what changed" />),
      server(<Textarea defaultValue="too short" aria-invalid />),
      server(<Textarea disabled />),
    );
  });

  test("carries data-slot and data-mk; an invalid textarea carries aria-invalid", () => {
    const rest = one(states[0]!, "textarea");
    expect(rest.el.getAttribute("data-slot")).toBe("textarea");
    expect(rest.el.getAttribute("data-mk")).toBe("textarea");
    expect(one(states[1]!, "textarea").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("the box is its own control: focus draws its edge, the caret takes --fx, and --fx turns to the error ink", () => {
    const { classes } = one(states[0]!, "textarea");
    expect(classes).toEqual(expect.arrayContaining([...SELF_EDGE, "caret-(--fx)", FX_PRIMARY]));
    expect(classes).toEqual(expect.arrayContaining(["aria-invalid:[--fx:var(--error)]", "aria-invalid:border-error"]));
  });

  test("carries only texture-disabled, and no forbidden class in any state", () => {
    const rendered = states.flatMap(elements);
    expect(detailsUsed(rendered, "textarea")).toEqual(claim("textarea"));
    expect(claim("textarea")).toEqual(["texture-disabled"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

describe("select", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(server(<SelectSpecimen />), server(<SelectSpecimen invalid />), server(<SelectSpecimen disabled />));
  });

  test("the trigger carries data-slot and data-mk; an invalid trigger carries aria-invalid", () => {
    const rest = one(states[0]!, "[data-slot=select-trigger]");
    expect(rest.el.getAttribute("data-mk")).toBe("select");
    expect(one(states[1]!, "[data-slot=select-trigger]").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("the trigger is a field whose box is the control: focus draws its edge in --fx", () => {
    const { classes } = one(states[0]!, "[data-slot=select-trigger]");
    expect(classes).toEqual(
      expect.arrayContaining([
        ...SELF_EDGE,
        FX_PRIMARY,
        "aria-invalid:[--fx:var(--error)]",
        "aria-invalid:border-error",
      ]),
    );
  });

  test("the global ring leaves the trigger alone, keyed on its data-slot", () => {
    const ring = css.match(/^\s*(.+):focus-visible \{\n\s*outline: 2px solid var\(--ring\);\n\s*outline-offset: 2px;/m);
    expect(ring?.[1]).toContain(':where(:not([data-slot="select-trigger"]))');
  });

  test("the trigger carries no texture class, at rest, invalid or disabled", () => {
    for (const state of states) {
      const { classes } = one(state, "[data-slot=select-trigger]");
      expect(classes.filter((cls) => parts(cls).utility.startsWith("texture-"))).toEqual([]);
    }
  });

  describe("open", () => {
    let body: HTMLElement;
    let done: () => Promise<void>;
    beforeAll(async () => {
      ({ body, done } = await client(<SelectSpecimen open />));
    });
    afterAll(async () => done());

    test("the popup is a raised layer with the contact edge, and never clips it", () => {
      const popup = one(body, "[data-slot=select-content]");
      expect(popup.el.getAttribute("data-mk")).toBe("select");
      expect(popup.classes).toEqual(
        expect.arrayContaining([
          "relative",
          "shadow-leaf",
          "texture-contact",
          "[--contact-lift:var(--elevation-leaf-rake)]",
        ]),
      );
      // texture-contact's screen sits outside the box, so an overflow on the popup would cut it away (build ruling 4)
      expect(popup.classes.filter((cls) => parts(cls).utility.startsWith("overflow"))).toEqual([]);
      const list = one(popup.el, "[data-slot=select-list]");
      expect(list.classes).toEqual(expect.arrayContaining(["max-h-(--available-height)", "overflow-y-auto"]));
    });

    // shadcn's tailwind.css narrows data-selected: to data-selected="true"; Base UI sets data-selected empty, so the
    // chosen option is styled on aria-selected, which Base UI sets to "true"
    test("the chosen option is boxed on aria-selected, never data-selected:", () => {
      const chosen = one(body, "[role=option][aria-selected=true]");
      expect(chosen.el.textContent).toBe("trisys");
      expect(chosen.classes).toEqual(
        expect.arrayContaining(["aria-selected:border-primary", "aria-selected:bg-accent"]),
      );
      const options = elements(body).filter(({ el }) => el.getAttribute("role") === "option");
      expect(options.flatMap(({ classes }) => classes.filter((cls) => cls.includes("data-selected")))).toEqual([]);
    });

    test("the open select carries only texture-contact, and no forbidden class", () => {
      const rendered = [...states.flatMap(elements), ...elements(body)];
      expect(body.querySelectorAll("[role=option]").length).toBe(ships.length);
      expect(detailsUsed(rendered, "select")).toEqual(claim("select"));
      expect(claim("select")).toEqual(["texture-contact"]);
      expect(forbidden(rendered)).toEqual([]);
    });

    // The popup's duration times its enter and exit keyframes. On its own it would also time a transition of
    // whatever the default property list names, so the popup says it transitions nothing.
    test("the popup animates in and out on its keyframes and transitions nothing", () => {
      const popup = one(body, "[data-slot=select-content]");
      expect(popup.classes).toEqual(
        expect.arrayContaining(["duration-(--duration-instant)", "data-open:animate-in", "transition-none"]),
      );
    });
  });

  describe("portal and offset", () => {
    test("the popup portals into the container its portal props name, carrying their class", async () => {
      const frame = document.createElement("div");
      document.body.append(frame);
      const { done } = await client(
        <SelectSpecimen open content={{ portalProps: { container: frame, className: "dark" } }} />,
      );
      try {
        const popup = one(frame, "[data-slot=select-content]");
        const portal = [...frame.children].find((child) => child.contains(popup.el));
        expect(portal?.classList.contains("dark")).toBe(true);
      } finally {
        await done();
        frame.remove();
      }
    });

    // The world prints the list 6 px under the trigger (reach.css .list). Under happy-dom every box measures 0, so
    // the positioner's translation from the trigger is the side offset alone.
    test("a list that opens under the trigger sits 6 px below it by default", async () => {
      const { body, done } = await client(<SelectSpecimen open content={{ alignItemWithTrigger: false }} />);
      try {
        const popup = one(body, "[data-slot=select-content]");
        const positioner = popup.el.parentElement as HTMLElement;
        expect(positioner.getAttribute("data-side")).toBe("bottom");
        expect(positioner.style.transform).toBe("translate(0px, 6px)");
      } finally {
        await done();
      }
    });
  });
});

// The world's input error glyph (M/reach.html, --g-bang decoded): the 14 px square with its corners notched and the
// bang knocked out, which the world prints in the failed glyph ink before a field's error message.
const WORLD_BANG =
  "M1 0h12v1h-12zM0 1h14v1h-14zM0 2h6v1h-6zM8 2h6v1h-6zM0 3h6v1h-6zM8 3h6v1h-6zM0 4h6v1h-6zM8 4h6v1h-6zM0 5h6v1h-6zM8 5h6v1h-6zM0 6h6v1h-6zM8 6h6v1h-6zM0 7h6v1h-6zM8 7h6v1h-6zM0 8h6v1h-6zM8 8h6v1h-6zM0 9h14v1h-14zM0 10h6v1h-6zM8 10h6v1h-6zM0 11h6v1h-6zM8 11h6v1h-6zM0 12h14v1h-14zM1 13h12v1h-12z";

describe("field-error glyph", () => {
  const master = JSON.parse(readFileSync(join(root, "tokens/master.json"), "utf8")) as {
    status: { states: Record<string, { role: string }>; "input error glyph": string };
  };

  test("draws the world's input error glyph, whole pixels, in the ink error text follows", () => {
    const svg = one(server(<FieldErrorGlyph />), "svg");
    expect(master.status["input error glyph"]).toBe("bang");
    expect(svg.el.querySelector("path")?.getAttribute("d")).toBe(WORLD_BANG);
    expect([svg.el.getAttribute("viewBox"), svg.el.getAttribute("width"), svg.el.getAttribute("height")]).toEqual([
      "0 0 14 14",
      "14",
      "14",
    ]);
    expect(svg.el.getAttribute("shape-rendering")).toBe("crispEdges");
    // error text and the invalid edge follow failed (master.json status.failed), and so does this glyph
    const ink = `text-${master.status.states.failed!.role}-glyph`;
    expect(svg.classes).toContain(ink);
    expect(css).toContain(`--color-${ink.slice("text-".length)}:`);
  });

  test("is hidden from screen readers until it gets a label, and takes the caller's classes", () => {
    const bare = one(server(<FieldErrorGlyph className="mt-0.5" />), "svg");
    expect(bare.el.getAttribute("aria-hidden")).toBe("true");
    expect(bare.classes).toContain("mt-0.5");
    const named = one(server(<FieldErrorGlyph aria-label="error" />), "svg");
    expect(named.el.getAttribute("role")).toBe("img");
    expect(named.el.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("checkbox", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<Checkbox aria-label="include drafts" />),
      server(<Checkbox aria-label="notify me" defaultChecked />),
      server(<Checkbox aria-label="every ship" indeterminate />),
      server(<Checkbox aria-label="locked" disabled defaultChecked />),
      server(<Checkbox aria-label="required" aria-invalid />),
    );
  });

  test("carries data-slot and data-mk; the mixed state is data-indeterminate and aria-checked mixed", () => {
    const rest = one(states[0]!, "[role=checkbox]");
    expect(rest.el.getAttribute("data-slot")).toBe("checkbox");
    expect(rest.el.getAttribute("data-mk")).toBe("checkbox");
    const mixed = one(states[2]!, "[role=checkbox]");
    expect(mixed.el.hasAttribute("data-indeterminate")).toBe(true);
    expect(mixed.el.getAttribute("aria-checked")).toBe("mixed");
    expect(one(states[4]!, "[role=checkbox]").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("it is a control: its span takes the 2 px ring 2 px outside it", () => {
    const { el, classes } = one(states[0]!, "[role=checkbox]");
    expect(el.tagName).toBe("SPAN");
    expect(classes).toEqual(
      expect.arrayContaining([
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-(--ring)",
      ]),
    );
  });

  test("carries only texture-mixed, and no forbidden class in any state", () => {
    const rendered = states.flatMap(elements);
    expect(one(states[2]!, "[role=checkbox]").classes).toContain("texture-mixed");
    expect(detailsUsed(rendered, "checkbox")).toEqual(claim("checkbox"));
    expect(claim("checkbox")).toEqual(["texture-mixed"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

// The disabled state is the text control's: the box and its addons name a disabled input or textarea, never any
// disabled descendant, so a disabled button inside the box leaves the box as it is (GATE.md, S1.F queue).
const TEXT_DISABLED = "has-[input:disabled,textarea:disabled]";

describe("input-group", () => {
  const groups: HTMLElement[] = [];
  beforeAll(() => {
    groups.push(
      server(
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>run-</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput defaultValue="failed" aria-label="filter runs" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="clear the filter">
              x
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>,
      ),
      server(
        <InputGroup>
          <InputGroupInput defaultValue="0000" aria-invalid aria-label="run id" />
        </InputGroup>,
      ),
      server(
        <InputGroup>
          <InputGroupTextarea placeholder="a note for the run" />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 / 280</InputGroupText>
          </InputGroupAddon>
        </InputGroup>,
      ),
      server(
        <InputGroup>
          <InputGroupInput disabled defaultValue="7" aria-label="chapter number" />
        </InputGroup>,
      ),
      server(
        <InputGroup>
          <InputGroupInput defaultValue="orbit" aria-label="ship" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton disabled>go</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>,
      ),
    );
  });

  test("the wrapper is the box: data-slot, data-mk and --fx, its edge drawn while its text control holds focus", () => {
    const box = one(groups[0]!, "[data-slot=input-group]");
    expect(box.el.getAttribute("data-mk")).toBe("input-group");
    expect(box.classes).toEqual(
      expect.arrayContaining([
        "has-[input:focus,textarea:focus]:border-(--fx)",
        "has-[input:focus,textarea:focus]:outline-2",
        "has-[input:focus,textarea:focus]:-outline-offset-2",
        "has-[input:focus,textarea:focus]:outline-(--fx)",
        FX_PRIMARY,
        "has-[[aria-invalid=true]]:[--fx:var(--error)]",
        "has-[[aria-invalid=true]]:border-error",
      ]),
    );
    expect(one(groups[1]!, "[data-slot=input-group-control]").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("the text controls inside carry outline-0 and caret-(--fx), and no edge, shadow, ring or other outline", () => {
    const controls = groups.flatMap((group) =>
      elements(group).filter(({ el }) => el.getAttribute("data-slot") === "input-group-control"),
    );
    expect(controls.map(({ el }) => el.tagName).sort()).toEqual(["INPUT", "INPUT", "INPUT", "INPUT", "TEXTAREA"]);
    for (const { el, classes } of controls) {
      expect(classes, el.tagName).toEqual(expect.arrayContaining(["outline-0", "caret-(--fx)"]));
      const drawn = classes.filter((cls) => {
        const { utility } = parts(cls);
        if (["border-0", "shadow-none", "outline-0"].includes(utility)) return false;
        return /^(border|shadow|ring|outline)(-|$)/.test(utility);
      });
      expect(drawn, el.tagName).toEqual([]);
    }
  });

  test("a button inside the box is a control: its ring is drawn inside it", () => {
    const button = one(groups[0]!, "button");
    expect(button.classes).toEqual(
      expect.arrayContaining([
        "focus-visible:outline-2",
        "focus-visible:-outline-offset-2",
        "focus-visible:outline-(--primary)",
      ]),
    );
  });

  test("the disabled state follows the text control, never a disabled button inside the box", () => {
    const box = one(groups[3]!, "[data-slot=input-group]");
    expect(box.classes).toEqual(
      expect.arrayContaining([
        `${TEXT_DISABLED}:bg-faint`,
        `${TEXT_DISABLED}:text-disabled`,
        `${TEXT_DISABLED}:cursor-not-allowed`,
      ]),
    );
    expect(one(groups[3]!, "[data-slot=input-group-control]").el.hasAttribute("disabled")).toBe(true);
    const addon = one(groups[0]!, "[data-slot=input-group-addon]");
    expect(addon.classes).toEqual(expect.arrayContaining([`group-${TEXT_DISABLED}/input-group:text-disabled`]));
    // the specimen with a disabled button keeps its text control enabled
    expect(one(groups[4]!, "button").el.hasAttribute("disabled")).toBe(true);
    expect(one(groups[4]!, "[data-slot=input-group-control]").el.hasAttribute("disabled")).toBe(false);
    // every disabled variant the group's own elements carry names the text control: its own disabled:, or the
    // box's and addons' match on a disabled input or textarea; never has-disabled: or group-has-disabled:
    const allowed = new Set(["disabled", TEXT_DISABLED, `group-${TEXT_DISABLED}/input-group`]);
    const strays = groups
      .flatMap((group) => own(elements(group), "input-group"))
      .flatMap(({ el, classes }) =>
        classes
          .filter((cls) =>
            parts(cls).variants.some(
              (v) =>
                v.includes("disabled") &&
                (!allowed.has(v) || (v === "disabled" && el.getAttribute("data-slot") !== "input-group-control")),
            ),
          )
          .map((cls) => `${el.getAttribute("data-slot") ?? el.tagName}: ${cls}`),
      );
    expect(strays).toEqual([]);
  });

  test("carries only texture-disabled, the nested button bringing its own, and no forbidden class in any state", () => {
    const rendered = groups.flatMap(elements);
    expect(one(groups[3]!, "[data-slot=input-group]").classes).toContain("texture-disabled");
    // the inner button is another item: it carries data-mk="button" and its own texture-disabled, which is not
    // counted for the group
    const nested = rendered.filter(({ el }) => el.closest("[data-mk=button]"));
    expect(nested.length).toBeGreaterThan(0);
    expect(own(rendered, "input-group").filter((r) => nested.includes(r))).toEqual([]);
    expect(detailsUsed(rendered, "input-group")).toEqual(claim("input-group"));
    expect(claim("input-group")).toEqual(["texture-disabled"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});
