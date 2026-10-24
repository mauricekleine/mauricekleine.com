import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { act, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { catalog } from "../items/catalog.ts";

// S1.4a's fields: steer 4's one focus state for every field (GATE.md, "the field focus rule"), the texture each
// item claims, and the classes no field may carry. The select popup is portaled, so it renders through
// react-dom/client into happy-dom (GATE.md build ruling 5); everything else renders with renderToString. The items
// and react-dom/client load after happy-dom registers, because Base UI picks its layout effect on import by whether
// a document exists.

const root = join(import.meta.dir, "..");
const details = JSON.parse(readFileSync(join(root, "tokens/details.json"), "utf8")) as { DETAILS: { key: string }[] };
const DETAIL_UTILITIES = new Set(details.DETAILS.map((d) => `texture-${d.key}`));
const css = readFileSync(join(root, "dist/v2/superthread.css"), "utf8");

let ui: {
  checkbox: typeof import("@/components/superthread/ui/checkbox");
  input: typeof import("@/components/superthread/ui/input");
  select: typeof import("@/components/superthread/ui/select");
  textarea: typeof import("@/components/superthread/ui/textarea");
};
let createRoot: typeof import("react-dom/client").createRoot;

beforeAll(async () => {
  GlobalRegistrator.register();
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
  ui = {
    checkbox: await import("@/components/superthread/ui/checkbox"),
    input: await import("@/components/superthread/ui/input"),
    select: await import("@/components/superthread/ui/select"),
    textarea: await import("@/components/superthread/ui/textarea"),
  };
});
afterAll(async () => {
  delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  await GlobalRegistrator.unregister();
});

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

// The component-detail utilities (texture-<DETAILS key>) the rendered classes use. The five places' utilities
// (texture-ramp, texture-line-<ship>) are not DETAILS keys, so they never count.
function detailsUsed(rendered: Rendered[]): string[] {
  const used = new Set<string>();
  for (const { classes } of rendered)
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

function SelectSpecimen(props: { open?: boolean; disabled?: boolean; invalid?: boolean }) {
  const { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } = ui.select;
  return (
    <Select defaultValue="trisys" open={props.open} disabled={props.disabled}>
      <SelectTrigger aria-label="ship" aria-invalid={props.invalid || undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
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
      server(<ui.input.Input placeholder="a ship name" />),
      server(<ui.input.Input defaultValue="no such ship" aria-invalid />),
      server(<ui.input.Input disabled defaultValue="7" />),
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
    expect(detailsUsed(rendered)).toEqual(claim("input"));
    expect(claim("input")).toEqual(["texture-disabled"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

describe("textarea", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<ui.textarea.Textarea placeholder="what changed" />),
      server(<ui.textarea.Textarea defaultValue="too short" aria-invalid />),
      server(<ui.textarea.Textarea disabled />),
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
    expect(detailsUsed(rendered)).toEqual(claim("textarea"));
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
      expect(detailsUsed(rendered)).toEqual(claim("select"));
      expect(claim("select")).toEqual(["texture-contact"]);
      expect(forbidden(rendered)).toEqual([]);
    });
  });
});

describe("checkbox", () => {
  const states: HTMLElement[] = [];
  beforeAll(() => {
    states.push(
      server(<ui.checkbox.Checkbox aria-label="include drafts" />),
      server(<ui.checkbox.Checkbox aria-label="notify me" defaultChecked />),
      server(<ui.checkbox.Checkbox aria-label="every ship" indeterminate />),
      server(<ui.checkbox.Checkbox aria-label="locked" disabled defaultChecked />),
      server(<ui.checkbox.Checkbox aria-label="required" aria-invalid />),
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
    expect(detailsUsed(rendered)).toEqual(claim("checkbox"));
    expect(claim("checkbox")).toEqual(["texture-mixed"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

// Integration-only (process rule 3): input-group renders S1.4b's Button, which is half written while stage 4 runs.
// The integration step runs these; a slice run leaves them out with -t '^(?!.*integration)'.
describe("input-group (integration: renders S1.4b's button)", () => {
  async function groups() {
    const ui = await import("@/components/superthread/ui/input-group");
    const { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } = ui;
    return [
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
    ];
  }

  test("the wrapper is the box: data-slot, data-mk and --fx, its edge drawn while its text control holds focus (integration)", async () => {
    const [rest, invalid] = await groups();
    const box = one(rest!, "[data-slot=input-group]");
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
    expect(one(invalid!, "[data-slot=input-group-control]").el.getAttribute("aria-invalid")).toBe("true");
  });

  test("the text controls inside carry outline-0 and caret-(--fx), and no edge, shadow, ring or other outline (integration)", async () => {
    const controls = (await groups()).flatMap((group) =>
      elements(group).filter(({ el }) => el.getAttribute("data-slot") === "input-group-control"),
    );
    expect(controls.map(({ el }) => el.tagName).sort()).toEqual(["INPUT", "INPUT", "INPUT", "TEXTAREA"]);
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

  test("a button inside the box is a control: its ring is drawn inside it (integration)", async () => {
    const [rest] = await groups();
    const button = one(rest!, "button");
    expect(button.classes).toEqual(
      expect.arrayContaining([
        "focus-visible:outline-2",
        "focus-visible:-outline-offset-2",
        "focus-visible:outline-(--primary)",
      ]),
    );
  });

  test("carries only texture-disabled, and no forbidden class in any state (integration)", async () => {
    const all = await groups();
    const rendered = all.flatMap(elements);
    expect(one(all[3]!, "[data-slot=input-group]").classes).toContain("texture-disabled");
    expect(detailsUsed(rendered)).toEqual(claim("input-group"));
    expect(claim("input-group")).toEqual(["texture-disabled"]);
    expect(forbidden(rendered)).toEqual([]);
  });
});
