// Render the layers through their public APIs: states, focus, lift, portals and the single claimed detail.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { act, type ComponentProps } from "react";
import { toast } from "sonner";
import * as Menu from "@/components/superthread/ui/dropdown-menu";
import * as Combo from "@/components/superthread/ui/combobox";
import * as Cmd from "@/components/superthread/ui/command";
import * as Alert from "@/components/superthread/ui/alert-dialog";
import { Toaster } from "@/components/superthread/ui/sonner";
import { Icon } from "@/components/superthread/ui/glyphs";
import { CONTROL_RING, claim, client, detailsUsed, elements, forbidden, one, parts } from "./rendered.tsx";

const INSIDE = ["focus-visible:outline-2", "focus-visible:-outline-offset-2", "focus-visible:outline-(--ring)"];
const LEAF = [
  "border",
  "border-border",
  "bg-popover",
  "shadow-leaf",
  "texture-contact",
  "[--contact-lift:var(--elevation-leaf-rake)]",
];
const ROW = ["h-9", "gap-2.5", "border", "border-transparent", "text-ui", ...INSIDE];
const KEYS = ["ml-auto", "font-mono", "text-[11px]", "tracking-[0.14em]", "text-muted-foreground"];
function has(scope: ParentNode, selector: string, classes: string[]) {
  const result = one(scope, selector);
  expect(result.classes).toEqual(expect.arrayContaining(classes));
  return result.el;
}
function layer(scope: ParentNode, slot: string, item: string) {
  const popup = one(scope, `[data-slot=${slot}]`);
  expect(popup.el.getAttribute("data-mk")).toBe(item);
  expect(popup.classes.filter((c) => parts(c).utility.startsWith("overflow"))).toEqual([]);
  return popup.el;
}
function skin(scope: ParentNode, item: string) {
  expect(forbidden(elements(scope))).toEqual([]);
  expect(detailsUsed(elements(scope), item)).toEqual(claim(item));
}

function MenuSpec({ content }: { content?: ComponentProps<typeof Menu.DropdownMenuContent> }) {
  return (
    <Menu.DropdownMenu defaultOpen>
      <Menu.DropdownMenuTrigger>actions</Menu.DropdownMenuTrigger>
      <Menu.DropdownMenuContent {...content}>
        <Menu.DropdownMenuGroup>
          <Menu.DropdownMenuLabel inset>run</Menu.DropdownMenuLabel>
          <Menu.DropdownMenuItem inset>
            open<Menu.DropdownMenuShortcut>⌘o</Menu.DropdownMenuShortcut>
          </Menu.DropdownMenuItem>
          <Menu.DropdownMenuItem variant="destructive">
            <Icon name="trash" />
            delete
          </Menu.DropdownMenuItem>
          <Menu.DropdownMenuItem disabled>locked</Menu.DropdownMenuItem>
        </Menu.DropdownMenuGroup>
        <Menu.DropdownMenuSeparator />
        <Menu.DropdownMenuCheckboxItem defaultChecked>notify</Menu.DropdownMenuCheckboxItem>
        <Menu.DropdownMenuRadioGroup defaultValue="orbit">
          <Menu.DropdownMenuRadioItem value="orbit">orbit</Menu.DropdownMenuRadioItem>
          <Menu.DropdownMenuRadioItem value="quanta">quanta</Menu.DropdownMenuRadioItem>
        </Menu.DropdownMenuRadioGroup>
        <Menu.DropdownMenuSub defaultOpen>
          <Menu.DropdownMenuSubTrigger inset>more</Menu.DropdownMenuSubTrigger>
          <Menu.DropdownMenuSubContent>
            <Menu.DropdownMenuItem>inspect</Menu.DropdownMenuItem>
          </Menu.DropdownMenuSubContent>
        </Menu.DropdownMenuSub>
      </Menu.DropdownMenuContent>
    </Menu.DropdownMenu>
  );
}
describe("dropdown-menu", () => {
  let body: HTMLElement;
  let done: () => Promise<void>;
  beforeAll(async () => {
    ({ body, done } = await client(<MenuSpec />));
  });
  afterAll(async () => done());
  test("trigger is marked and takes the outside control ring", () => {
    expect(has(body, "[data-slot=dropdown-menu-trigger]", CONTROL_RING).getAttribute("data-mk")).toBe("dropdown-menu");
  });
  test("parent and submenu are unclipped leaf lists, scrolling inside; the parent sits 6 px below", () => {
    for (const slot of ["dropdown-menu-content", "dropdown-menu-sub-content"]) {
      const popup = layer(body, slot, "dropdown-menu");
      has(body, `[data-slot=${slot}]`, [
        ...LEAF,
        "min-w-36",
        "p-1",
        "transition-none",
        "duration-(--duration-instant)",
        "data-open:animate-in",
        "data-closed:fade-out-0",
      ]);
      has(popup, ".overflow-y-auto", ["max-h-(--available-height)"]);
    }
    expect((one(body, "[data-slot=dropdown-menu-content]").el.parentElement as HTMLElement).style.transform).toBe(
      "translate(0px, 6px)",
    );
  });
  test("rows highlight with an inside ring, retain inset, destructive and disabled states", () => {
    for (const { classes } of elements(body).filter(({ el }) => el.matches("[role^=menuitem]")))
      expect(classes).toEqual(expect.arrayContaining([...ROW, "data-highlighted:bg-raised-hover"]));
    has(body, "[data-variant=destructive]", ["data-[variant=destructive]:text-destructive"]);
    has(body, "[data-inset=true][role=menuitem]", ["data-inset:pl-8"]);
    has(body, "[role=menuitem][data-disabled]", ["data-disabled:text-disabled"]);
    const sub = has(body, "[data-slot=dropdown-menu-sub-trigger]", ["data-popup-open:bg-raised-hover"]);
    has(sub, "svg", ["-rotate-90"]);
  });
  test("check and chosen radio have a fixed left column, with a check or 6 px house square", () => {
    const check = one(body, "[role=menuitemcheckbox][aria-checked=true]").el;
    has(check, "[data-slot=dropdown-menu-checkbox-item-indicator]", ["left-2.5"]);
    expect(check.querySelector("svg")).not.toBeNull();
    const radio = one(body, "[role=menuitemradio][aria-checked=true]").el;
    has(radio, "[data-slot=dropdown-menu-radio-item-indicator]", ["left-2.5"]);
    has(radio, ".bg-primary", ["size-1.5"]);
  });
  test("labels, rules and shortcuts keep the menu hierarchy; contact is the only detail", () => {
    has(body, "[data-slot=dropdown-menu-label]", ["type-meta", "px-2.5", "pt-1.5", "pb-1"]);
    has(body, "[data-slot=dropdown-menu-shortcut]", KEYS);
    has(body, "[data-slot=dropdown-menu-separator]", ["h-px", "bg-border", "-mx-1", "my-1"]);
    skin(body, "dropdown-menu");
  });
  test("portalProps forward the container and its mode", async () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    const mounted = await client(<MenuSpec content={{ portalProps: { container: frame, className: "dark" } }} />);
    try {
      expect(one(frame, "[data-slot=dropdown-menu-content]").el.closest(".dark")).not.toBeNull();
    } finally {
      await mounted.done();
      frame.remove();
    }
  });
});

const ships = ["orbit", "quanta", "trisys"];
function ComboSpec({ content }: { content?: ComponentProps<typeof Combo.ComboboxContent> }) {
  return (
    <Combo.Combobox items={ships} defaultValue="quanta" defaultOpen>
      <Combo.ComboboxInput aria-label="ship" showClear />
      <Combo.ComboboxContent {...content}>
        <Combo.ComboboxEmpty>no ships</Combo.ComboboxEmpty>
        <Combo.ComboboxList>
          <Combo.ComboboxGroup>
            <Combo.ComboboxLabel>ships</Combo.ComboboxLabel>
            {ships.map((ship) => (
              <Combo.ComboboxItem key={ship} value={ship}>
                {ship}
              </Combo.ComboboxItem>
            ))}
          </Combo.ComboboxGroup>
        </Combo.ComboboxList>
      </Combo.ComboboxContent>
    </Combo.Combobox>
  );
}
describe("combobox", () => {
  let body: HTMLElement;
  let done: () => Promise<void>;
  beforeAll(async () => {
    ({ body, done } = await client(<ComboSpec />));
  });
  afterAll(async () => done());
  test("the field box owns focus; trigger and clear keep their own inside control rings", () => {
    const box = has(body, "[data-slot=input-group]", [
      "border-input",
      "has-[input:focus,textarea:focus]:outline-2",
      "has-[input:focus,textarea:focus]:-outline-offset-2",
      "has-[[aria-invalid=true]]:[--fx:var(--error)]",
    ]);
    has(box, "input", ["outline-0"]);
    for (const slot of ["input-group-button", "combobox-clear"])
      has(box, `[data-slot=${slot}]`, ["focus-visible:outline-2", "focus-visible:-outline-offset-2"]);
  });
  test("the popup is an unclipped leaf list with an inner scroll and 6 px default offset", () => {
    layer(body, "combobox-content", "combobox");
    has(body, "[data-slot=combobox-content]", LEAF);
    has(body, "[data-slot=combobox-list]", ["overflow-y-auto"]);
    expect((one(body, "[data-slot=combobox-content]").el.parentElement as HTMLElement).style.transform).toBe(
      "translate(0px, 6px)",
    );
  });
  test("aria-selected boxes the chosen option, highlight previews other rows, and the check sits at the end", () => {
    const chosen = has(body, "[role=option][aria-selected=true]", [
      ...ROW,
      "aria-selected:border-primary",
      "aria-selected:bg-accent",
      "data-highlighted:not-aria-selected:bg-raised-hover",
    ]);
    expect(chosen.textContent).toBe("quanta");
    has(chosen, ".absolute", ["right-2.5"]);
    expect(one(body, "[role=option]").classes.some((c) => c.includes("data-selected"))).toBe(false);
    has(body, "[data-slot=combobox-label]", ["type-meta"]);
    skin(body, "combobox");
  });
  test("multiple values print 24 px chips with named 16 px remove controls and a frameless input", async () => {
    const mounted = await client(
      <Combo.Combobox multiple items={ships} defaultValue={["orbit", "quanta"]}>
        <Combo.ComboboxChips>
          <Combo.ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <Combo.ComboboxChip key={value}>{value}</Combo.ComboboxChip>
                ))}
                <Combo.ComboboxChipsInput aria-label="add ship" />
              </>
            )}
          </Combo.ComboboxValue>
        </Combo.ComboboxChips>
      </Combo.Combobox>,
    );
    try {
      const box = has(mounted.body, "[data-slot=combobox-chips]", [
        "has-[input:focus]:outline-2",
        "has-[input:focus]:-outline-offset-2",
        "has-[[aria-invalid=true]]:[--fx:var(--error)]",
      ]);
      expect(box.querySelectorAll("[data-slot=combobox-chip]")).toHaveLength(2);
      const chip = has(box, "[data-slot=combobox-chip]", ["h-6", "border-border", "bg-secondary", "type-instrument"]);
      const remove = has(chip, "[data-slot=combobox-chip-remove]", ["size-4"]);
      expect(remove.getAttribute("aria-label")).toBe("remove");
      has(box, "input", ["outline-0"]);
      await act(async () => (remove as HTMLElement).click());
      expect(box.querySelectorAll("[data-slot=combobox-chip]")).toHaveLength(1);
    } finally {
      await mounted.done();
    }
  });
  test("empty results keep the centred instrument message", async () => {
    const mounted = await client(
      <Combo.Combobox items={[]} defaultOpen>
        <Combo.ComboboxInput aria-label="empty" />
        <Combo.ComboboxContent>
          <Combo.ComboboxEmpty>no ships</Combo.ComboboxEmpty>
          <Combo.ComboboxList />
        </Combo.ComboboxContent>
      </Combo.Combobox>,
    );
    try {
      has(mounted.body, "[data-slot=combobox-empty]", [
        "py-6",
        "type-instrument",
        "text-center",
        "text-muted-foreground",
      ]);
    } finally {
      await mounted.done();
    }
  });
  test("portalProps forward the container and its mode", async () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    const mounted = await client(<ComboSpec content={{ portalProps: { container: frame, className: "dark" } }} />);
    try {
      expect(one(frame, "[data-slot=combobox-content]").el.closest(".dark")).not.toBeNull();
    } finally {
      await mounted.done();
      frame.remove();
    }
  });
});

function Commands() {
  return (
    <Cmd.Command defaultValue="open">
      <Cmd.CommandInput placeholder="search commands" />
      <Cmd.CommandList>
        <Cmd.CommandEmpty>no commands</Cmd.CommandEmpty>
        <Cmd.CommandGroup heading="run">
          <Cmd.CommandItem value="open">
            open<Cmd.CommandShortcut>⌘o</Cmd.CommandShortcut>
          </Cmd.CommandItem>
          <Cmd.CommandItem value="delete" disabled>
            delete
          </Cmd.CommandItem>
        </Cmd.CommandGroup>
        <Cmd.CommandSeparator />
      </Cmd.CommandList>
    </Cmd.Command>
  );
}
describe("command", () => {
  let body: HTMLElement;
  let done: () => Promise<void>;
  beforeAll(async () => {
    ({ body, done } = await client(<Commands />));
  });
  afterAll(async () => done());
  test("the flat root takes no lift; search uses a 40 px field box and frameless input", () => {
    const root = has(body, "[data-slot=command]", ["bg-popover", "text-popover-foreground"]);
    expect(root.getAttribute("data-mk")).toBe("command");
    expect(one(body, "[data-slot=command]").classes.some((c) => c.includes("shadow"))).toBe(false);
    has(root, "[data-slot=input-group]", ["h-10"]);
    has(root, "[data-slot=command-input]", ["outline-0"]);
  });
  test("cmdk selected means highlight, with hover fill rather than a chosen box; disabled ink stays plain", () => {
    expect(
      has(body, "[cmdk-item][data-selected=true]", [...ROW, "data-[selected=true]:bg-raised-hover"]).textContent,
    ).toBe("open⌘o");
    has(body, "[cmdk-item][data-disabled=true]", ["data-[disabled=true]:text-disabled"]);
    expect(
      one(body, "[cmdk-item]").classes.some((c) => c.includes("selected:border") || c.includes("selected:bg-accent")),
    ).toBe(false);
  });
  test("the scroll list, heading and shortcuts keep the menu hierarchy, with no own detail", () => {
    expect(
      has(body, "[data-slot=command-list]", ["max-h-72", "overflow-y-auto", "p-1"]).getAttribute("aria-label"),
    ).toBe("suggestions");
    has(body, "[data-slot=command-group]", ["[&_[cmdk-group-heading]]:type-meta"]);
    has(body, "[data-slot=command-shortcut]", KEYS);
    skin(body, "command");
  });
  test("the palette portals our sheet with p-0 and lowercase accessible text inside it", async () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    const mounted = await client(
      <Cmd.CommandDialog open portalProps={{ container: frame, className: "dark" }}>
        <Commands />
      </Cmd.CommandDialog>,
    );
    try {
      const popup = has(frame, "[role=dialog]", ["p-0", "shadow-sheet", "texture-contact"]);
      expect(popup.closest(".dark")).not.toBeNull();
      const title = one(popup, "[data-slot=dialog-title]").el;
      expect(title.textContent).toBe("command palette");
      expect(one(popup, "[data-slot=dialog-description]").el.textContent).toBe("search for a command to run");
      expect(popup.getAttribute("aria-labelledby")).toBe(title.id);
      expect(popup.querySelector("[data-slot=dialog-close]")).toBeNull();
    } finally {
      await mounted.done();
      frame.remove();
    }
  });
});

function AlertSpec({ content }: { content?: ComponentProps<typeof Alert.AlertDialogContent> }) {
  return (
    <Alert.AlertDialog defaultOpen>
      <Alert.AlertDialogTrigger>delete</Alert.AlertDialogTrigger>
      <Alert.AlertDialogContent {...content}>
        <Alert.AlertDialogHeader>
          <Alert.AlertDialogMedia>
            <Icon name="trash" />
          </Alert.AlertDialogMedia>
          <Alert.AlertDialogTitle>delete run?</Alert.AlertDialogTitle>
          <Alert.AlertDialogDescription>this removes the run</Alert.AlertDialogDescription>
        </Alert.AlertDialogHeader>
        <Alert.AlertDialogFooter>
          <Alert.AlertDialogCancel>cancel</Alert.AlertDialogCancel>
          <Alert.AlertDialogAction>delete</Alert.AlertDialogAction>
        </Alert.AlertDialogFooter>
      </Alert.AlertDialogContent>
    </Alert.AlertDialog>
  );
}
describe("alert-dialog", () => {
  let body: HTMLElement;
  let done: () => Promise<void>;
  beforeAll(async () => {
    ({ body, done } = await client(<AlertSpec />));
  });
  afterAll(async () => done());
  test("the unclipped modal is a whole-pixel centred sheet with a plain scrim and quick keyframe fade", () => {
    expect(layer(body, "alert-dialog-content", "alert-dialog").getAttribute("role")).toBe("alertdialog");
    has(body, "[data-slot=alert-dialog-content]", [
      "shadow-sheet",
      "texture-contact",
      "[--contact-lift:var(--elevation-sheet-rake)]",
      "sm:max-w-[440px]",
      "p-7",
      "top-[round(50%,1px)]",
      "[translate:round(-50%,1px)_round(-50%,1px)]",
      "duration-(--duration-quick)",
      "transition-none",
    ]);
    has(body, "[data-slot=alert-dialog-overlay]", ["bg-scrim"]);
  });
  test("the title, media and right-aligned footer keep the sheet hierarchy and house buttons", () => {
    has(body, "[data-slot=alert-dialog-title]", ["type-subtitle"]);
    has(body, "[data-slot=alert-dialog-description]", ["text-ui", "text-muted-foreground"]);
    has(body, "[data-slot=alert-dialog-media]", ["size-10", "bg-secondary"]);
    has(body, "[data-slot=alert-dialog-footer]", ["mt-6", "justify-end", "gap-2"]);
    has(body, "[data-slot=alert-dialog-action]", ["bg-primary"]);
    has(body, "[data-slot=alert-dialog-cancel]", ["border-current"]);
    skin(body, "alert-dialog");
  });
  test("small keeps the compact width; portalProps carry mode and container; cancel closes", async () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    const mounted = await client(
      <AlertSpec content={{ size: "sm", portalProps: { container: frame, className: "dark" } }} />,
    );
    try {
      const popup = has(frame, "[role=alertdialog]", ["data-[size=sm]:max-w-xs"]);
      expect(popup.getAttribute("data-size")).toBe("sm");
      expect(popup.closest(".dark")).not.toBeNull();
      await act(async () => (one(popup, "[data-slot=alert-dialog-cancel]").el as HTMLElement).click());
      expect(frame.querySelector("[role=alertdialog]")).toBeNull();
    } finally {
      await mounted.done();
      frame.remove();
    }
  });
});

describe("sonner", () => {
  let body: HTMLElement;
  let done: () => Promise<void>;
  const kinds = ["success", "info", "warning", "error", "loading"] as const;
  beforeAll(async () => {
    ({ body, done } = await client(<Toaster id="layers-test" visibleToasts={8} duration={Infinity} closeButton />));
    await act(async () => {
      for (const kind of kinds)
        toast[kind](kind, {
          toasterId: "layers-test",
          description: "synthetic",
          action: { label: "undo", onClick: () => {} },
          cancel: { label: "cancel", onClick: () => {} },
        });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
  afterAll(async () => {
    await act(async () => {
      toast.dismiss();
    });
    await done();
  });
  test("the wrapper marks the item and all supplied notification labels are lowercase", () => {
    expect(one(body, "[data-slot=sonner]").el.getAttribute("data-mk")).toBe("sonner");
    expect(one(body, "section[aria-live=polite]").el.getAttribute("aria-label")).toBe("notifications");
    expect(body.querySelectorAll("[data-sonner-toast]")).toHaveLength(5);
    for (const el of body.querySelectorAll("[data-close-button]"))
      expect(el.getAttribute("aria-label")).toBe("close toast");
  });
  test("each kind is unstyled and expanded on the leaf lift; its contact edge never clips", () => {
    for (const { el, classes } of elements(body).filter(({ el }) => el.hasAttribute("data-sonner-toast"))) {
      expect(el.getAttribute("data-styled")).toBe("false");
      expect(el.getAttribute("data-expanded")).toBe("true");
      expect(classes).toEqual(
        expect.arrayContaining([
          "bg-popover",
          "border-border",
          "p-4",
          "shadow-leaf!",
          "texture-contact!",
          "[--contact-lift:var(--elevation-leaf-rake)]",
          "transition-[transform,opacity,height]!",
          "duration-(--duration-travel)!",
        ]),
      );
      expect(classes.some((c) => parts(c).utility.startsWith("overflow"))).toBe(false);
    }
  });
  test("each kind prints its 14 px status glyph; loading never uses a spinner", () => {
    for (const [kind, ink] of [
      ["success", "success"],
      ["info", "info"],
      ["warning", "warning"],
      ["error", "error"],
      ["loading", "info"],
    ]) {
      const glyph = has(body, `[data-sonner-toast][data-type=${kind}] [data-icon] svg`, [`text-${ink}-glyph`]);
      expect(glyph.getAttribute("width")).toBe("14");
      expect(glyph.getAttribute("viewBox")).toBe("0 0 14 14");
    }
    expect(one(body, "[data-type=loading] [data-icon] svg").el.innerHTML).toBe(
      one(body, "[data-type=info] [data-icon] svg").el.innerHTML,
    );
    expect(body.querySelector(".sonner-spinner")).toBeNull();
    has(body, ".sonner-loader", ["transform-none!", "transition-none!"]);
  });
  test("title, description and actions keep the toast hierarchy; contact is its only detail", () => {
    const row = one(body, "[data-sonner-toast]").el;
    has(row, "[data-title]", ["text-ui", "font-medium"]);
    has(row, "[data-description]", ["type-instrument", "text-muted-foreground!"]);
    has(row, "[data-action]", ["h-8", "bg-primary"]);
    has(row, "[data-cancel]", ["h-8", "border-current"]);
    skin(body, "sonner");
  });
});
