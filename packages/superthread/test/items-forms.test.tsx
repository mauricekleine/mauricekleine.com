// The forms 2.0 adds keep native semantics while their boxes, rules and labels print in the house inks.
import { describe, expect, test } from "bun:test";
import { act } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/superthread/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/superthread/ui/breadcrumb";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/superthread/ui/field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/superthread/ui/native-select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/superthread/ui/resizable";
import {
  CONTROL_RING,
  SELF_EDGE,
  claim,
  client,
  detailsUsed,
  elements,
  forbidden,
  one,
  own,
  server,
} from "./rendered.tsx";

function clean(hosts: HTMLElement[], item: string) {
  const rendered = hosts.flatMap(elements);
  expect(forbidden(own(rendered, item))).toEqual([]);
  expect(detailsUsed(rendered, item)).toEqual(claim(item));
  expect(claim(item)).toEqual([]);
}

describe("field", () => {
  test("keeps all orientation variants and composes its layout parts", () => {
    for (const orientation of ["vertical", "horizontal", "responsive"] as const) {
      const host = server(
        <FieldSet>
          <FieldLegend>profile</FieldLegend>
          <FieldGroup>
            <Field orientation={orientation}>
              <FieldContent>
                <FieldLabel htmlFor="email">email</FieldLabel>
                <input id="email" />
                <FieldDescription>work address</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>,
      );
      const field = one(host, '[data-mk="field"]');
      expect(field.el.getAttribute("role")).toBe("group");
      expect(field.el.getAttribute("data-orientation")).toBe(orientation);
      expect(field.classes).toContain(orientation === "horizontal" ? "flex-row" : "flex-col");
      if (orientation === "responsive") expect(field.classes).toContain("@md/field-group:flex-row");
      expect(one(host, '[data-slot="field-label"]').el.getAttribute("for")).toBe("email");
    }
  });
  test("legends and copy use their type roles, and labels keep invalid and disabled ink", () => {
    const host = server(
      <FieldSet>
        <FieldLegend>profile</FieldLegend>
        <FieldLegend variant="label">email</FieldLegend>
        <Field data-invalid="true" data-disabled="true">
          <FieldLabel>address</FieldLabel>
          <FieldTitle>title</FieldTitle>
          <FieldDescription>
            read <a href="#help">help</a>
          </FieldDescription>
        </Field>
      </FieldSet>,
    );
    expect(one(host, '[data-variant="legend"]').classes).toEqual(
      expect.arrayContaining(["type-meta", "text-muted-foreground"]),
    );
    expect(one(host, '[data-variant="label"]').classes).toEqual(
      expect.arrayContaining(["text-ui", "font-medium", "text-foreground"]),
    );
    for (const label of host.querySelectorAll('[data-slot="field-label"]'))
      expect(label.className.split(" ")).toEqual(
        expect.arrayContaining([
          "text-ui",
          "font-medium",
          "group-data-[invalid=true]/field:text-error",
          "group-data-[disabled=true]/field:text-disabled",
        ]),
      );
    expect(one(host, '[data-slot="field-description"]').classes).toEqual(
      expect.arrayContaining([
        "type-instrument",
        "text-muted-foreground",
        "[&_a]:text-primary",
        "[&_a:hover]:underline",
      ]),
    );
  });
  test("the checked choice card boxes the field in plum with 16 px padding", () => {
    const host = server(
      <FieldLabel>
        <Field orientation="horizontal">
          <Checkbox defaultChecked />
          <FieldTitle>updates</FieldTitle>
        </Field>
      </FieldLabel>,
    );
    expect(one(host, "[data-checked]").el.getAttribute("aria-checked")).toBe("true");
    expect(one(host, 'label[data-slot="field-label"]').classes).toEqual(
      expect.arrayContaining([
        "has-[>[data-slot=field]]:border",
        "has-[>[data-slot=field]]:border-border",
        "has-[>[data-slot=field]]:p-4",
        "has-[>[data-slot=field]]:has-data-checked:border-primary",
        "has-[>[data-slot=field]]:has-data-checked:bg-accent",
      ]),
    );
  });
  test("empty errors render nothing; duplicates and absent messages add no lines", () => {
    expect(server(<FieldError errors={[undefined, {}, { message: "" }]} />).innerHTML).toBe("");
    const host = server(<FieldError errors={[undefined, { message: "required" }, { message: "required" }]} />);
    expect(one(host, '[role="alert"]').el.textContent).toBe("required");
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("ul")).toBeNull();
  });
  test("each distinct error leads with a bang glyph and children override the errors array", () => {
    const host = server(
      <FieldError errors={[{ message: "required" }, { message: "use a work address" }, { message: "required" }]} />,
    );
    expect(one(host, '[role="alert"]').classes).toEqual(expect.arrayContaining(["type-instrument", "text-error"]));
    const lines = host.querySelectorAll("li");
    expect([...lines].map((line) => line.textContent)).toEqual(["required", "use a work address"]);
    for (const line of lines) {
      expect(line.firstElementChild?.tagName.toLowerCase()).toBe("svg");
      expect(one(line, "svg").classes).toContain("text-error-glyph");
      expect(line.className.split(" ")).toEqual(expect.arrayContaining(["flex", "items-start", "gap-2"]));
    }
    const custom = server(
      <FieldError errors={[{ message: "ignored" }]}>
        <a href="#email">check your email</a>
      </FieldError>,
    );
    expect(one(custom, '[role="alert"]').el.textContent).toBe("check your email");
    expect(custom.querySelectorAll("svg")).toHaveLength(1);
    expect(one(custom, "a").el.getAttribute("href")).toBe("#email");
  });
  test("the separator prints its meta label on stock over a 1 px rule", () => {
    const host = server(<FieldSeparator>or</FieldSeparator>);
    expect(one(host, '[data-slot="separator"]').classes).toEqual(expect.arrayContaining(["h-px", "bg-border"]));
    expect(one(host, '[data-slot="field-separator-content"]').classes).toEqual(
      expect.arrayContaining(["bg-background", "type-meta", "text-muted-foreground"]),
    );
  });
  test("no texture or forbidden class across states and choice cards", () => {
    clean(
      [
        server(
          <Field data-disabled="true" data-invalid="true">
            <FieldLabel>email</FieldLabel>
            <FieldTitle>title</FieldTitle>
            <FieldDescription>hint</FieldDescription>
            <FieldError>required</FieldError>
          </Field>,
        ),
        server(
          <FieldLabel>
            <Field>
              <Checkbox defaultChecked />
              <FieldTitle>updates</FieldTitle>
            </Field>
          </FieldLabel>,
        ),
        server(
          <FieldSet>
            <FieldLegend>profile</FieldLegend>
            <FieldGroup>
              <FieldSeparator>or</FieldSeparator>
            </FieldGroup>
          </FieldSet>,
        ),
      ],
      "field",
    );
  });
});

describe("native-select", () => {
  test("marks the wrapper and keeps select, option, optgroup and caller props", () => {
    const host = server(
      <NativeSelect aria-label="ship" name="ship" defaultValue="quanta" className="w-60">
        <NativeSelectOptGroup label="ships">
          <NativeSelectOption value="orbit">orbit</NativeSelectOption>
          <NativeSelectOption value="quanta">quanta</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );
    expect(one(host, '[data-mk="native-select"]').classes).toContain("w-60");
    expect(one(host, "select").el.getAttribute("name")).toBe("ship");
    expect(one(host, "select").el.getAttribute("aria-label")).toBe("ship");
    expect(one(host, "option[selected]").el.getAttribute("value")).toBe("quanta");
    expect(one(host, "optgroup").el.getAttribute("label")).toBe("ships");
  });
  test("the box owns focus for click and keyboard, including invalid ink", () => {
    const select = one(
      server(
        <NativeSelect aria-invalid>
          <NativeSelectOption>orbit</NativeSelectOption>
        </NativeSelect>,
      ),
      "select",
    );
    expect(select.classes).toEqual(
      expect.arrayContaining([
        ...SELF_EDGE,
        "[--fx:var(--primary)]",
        "aria-invalid:border-error",
        "aria-invalid:[--fx:var(--error)]",
      ]),
    );
    expect(select.el.getAttribute("aria-invalid")).toBe("true");
  });
  test("sizes are 40 and 32 px, disabled is flat, and the chevron never catches input", () => {
    for (const size of ["default", "sm"] as const) {
      const host = server(
        <NativeSelect size={size} disabled>
          <NativeSelectOption>orbit</NativeSelectOption>
        </NativeSelect>,
      );
      const select = one(host, "select");
      expect(select.el.getAttribute("data-size")).toBe(size);
      expect(select.el.hasAttribute("disabled")).toBe(true);
      expect(select.classes).toEqual(
        expect.arrayContaining([
          "h-10",
          "data-[size=sm]:h-8",
          "border-input",
          "bg-background",
          "px-3",
          "pr-8",
          "disabled:bg-faint",
          "disabled:text-disabled",
          "disabled:cursor-not-allowed",
        ]),
      );
      expect(one(host, '[data-slot="native-select-icon"]').classes).toContain("pointer-events-none");
    }
  });
  test("no texture or forbidden class in any state", () => {
    clean(
      [server(<NativeSelect />), server(<NativeSelect size="sm" />), server(<NativeSelect disabled aria-invalid />)],
      "native-select",
    );
  });
});

function accordion() {
  return (
    <Accordion defaultValue={["details"]}>
      <AccordionItem value="details">
        <AccordionTrigger>details</AccordionTrigger>
        <AccordionContent>
          <a href="#run">run log</a>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="locked" disabled>
        <AccordionTrigger>locked</AccordionTrigger>
        <AccordionContent>unavailable</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("accordion", () => {
  test("the root opens with a top rule and every row carries a bottom rule", () => {
    const host = server(accordion());
    expect(one(host, '[data-mk="accordion"]').classes).toEqual(expect.arrayContaining(["border-t", "border-border"]));
    for (const item of host.querySelectorAll('[data-slot="accordion-item"]'))
      expect(item.className.split(" ")).toEqual(expect.arrayContaining(["border-b", "border-border"]));
  });
  test("the full-width trigger keeps an inside ring and one rotating chevron", () => {
    const host = server(accordion());
    expect(one(host, '[data-slot="accordion-trigger"]').classes).toEqual(
      expect.arrayContaining([
        "w-full",
        "min-h-12",
        "py-3",
        "text-ui",
        "font-medium",
        "hover:underline",
        "underline-offset-4",
        "focus-visible:outline-2",
        "focus-visible:-outline-offset-2",
        "focus-visible:outline-(--ring)",
        "data-disabled:text-disabled",
      ]),
    );
    for (const trigger of host.querySelectorAll('[data-slot="accordion-trigger"]'))
      expect(trigger.querySelectorAll('[data-slot="accordion-trigger-icon"]')).toHaveLength(1);
    expect(one(host, '[data-slot="accordion-trigger-icon"]').classes).toEqual(
      expect.arrayContaining([
        "group-aria-expanded/accordion-trigger:rotate-180",
        "transition-[rotate]",
        "duration-(--duration-quick)",
        "ease-(--ease-brand)",
      ]),
    );
  });
  test("the measured panel owns height travel and state attributes with padding on its content", () => {
    const panel = one(server(accordion()), '[data-slot="accordion-content"]');
    expect(panel.el.hasAttribute("data-open")).toBe(true);
    expect(panel.classes).toEqual(
      expect.arrayContaining([
        "h-(--accordion-panel-height)",
        "transition-[height]",
        "duration-(--duration-quick)",
        "ease-(--ease-brand)",
        "data-starting-style:h-0",
        "data-ending-style:h-0",
        "overflow-hidden",
      ]),
    );
    expect(panel.el.firstElementChild?.className.split(" ")).toEqual(
      expect.arrayContaining(["pb-4", "text-ui", "text-muted-foreground", "[&_a]:text-primary"]),
    );
  });
  test("enabled triggers toggle while disabled items stay closed", async () => {
    const view = await client(accordion());
    try {
      const triggers = [...view.body.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')];
      expect(triggers[0]!.getAttribute("aria-expanded")).toBe("true");
      await act(async () => triggers[0]!.click());
      expect(triggers[0]!.getAttribute("aria-expanded")).toBe("false");
      await act(async () => triggers[0]!.click());
      expect(triggers[0]!.getAttribute("aria-expanded")).toBe("true");
      expect(triggers[1]!.hasAttribute("data-disabled")).toBe(true);
      await act(async () => triggers[1]!.click());
      expect(triggers[1]!.getAttribute("aria-expanded")).toBe("false");
    } finally {
      await view.done();
    }
  });
  test("no texture or forbidden class across open, closed and disabled rows", () => {
    clean([server(accordion())], "accordion");
  });
});

function breadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/runs" render={<a data-custom="link" />}>
            runs
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>run details</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("breadcrumb", () => {
  test("names navigation and the current page while custom rendering keeps link props", () => {
    const host = server(breadcrumb());
    expect(one(host, '[data-mk="breadcrumb"]').el.getAttribute("aria-label")).toBe("breadcrumb");
    const link = one(host, '[data-slot="breadcrumb-link"]');
    expect(link.el.getAttribute("href")).toBe("/runs");
    expect(link.el.getAttribute("data-custom")).toBe("link");
    expect(one(host, '[aria-current="page"]').classes).toContain("text-foreground");
  });
  test("the wrapping instrument path keeps muted links, named motion and the control ring", () => {
    const host = server(breadcrumb());
    expect(one(host, '[data-slot="breadcrumb-list"]').classes).toEqual(
      expect.arrayContaining([
        "flex",
        "flex-wrap",
        "items-center",
        "gap-1.5",
        "type-instrument",
        "text-muted-foreground",
      ]),
    );
    expect(one(host, '[data-slot="breadcrumb-link"]').classes).toEqual(
      expect.arrayContaining([
        ...CONTROL_RING,
        "text-muted-foreground",
        "hover:text-foreground",
        "transition-[color]",
        "duration-(--duration-instant)",
        "ease-(--ease-brand)",
      ]),
    );
  });
  test("separators face right, custom separators stay, and the ellipsis says more", () => {
    const host = server(breadcrumb());
    expect(one(host, '[data-slot="breadcrumb-separator"] svg').classes).toContain("-rotate-90");
    expect(host.querySelectorAll('[data-slot="breadcrumb-separator"]')[1]!.textContent).toBe("/");
    expect(one(host, '[data-slot="breadcrumb-ellipsis"]').classes).toContain("size-5");
    expect(one(host, ".sr-only").el.textContent).toBe("more");
  });
  test("no texture or forbidden class in the full path", () => {
    clean([server(breadcrumb())], "breadcrumb");
  });
});

function resizable(orientation: "horizontal" | "vertical", withHandle = false, disabled = false) {
  return (
    <ResizablePanelGroup orientation={orientation}>
      <ResizablePanel defaultSize="40%">runs</ResizablePanel>
      <ResizableHandle withHandle={withHandle} disabled={disabled} />
      <ResizablePanel defaultSize="60%">details</ResizablePanel>
    </ResizablePanelGroup>
  );
}

describe("resizable", () => {
  test("keeps group sizing, panel slots and native separator orientation and disabled state", () => {
    for (const orientation of ["horizontal", "vertical"] as const) {
      const host = server(resizable(orientation, false, true));
      const group = one(host, '[data-mk="resizable"]');
      expect(group.classes).toEqual(expect.arrayContaining(["flex", "h-full", "w-full"]));
      expect((group.el as HTMLElement).style.flexDirection).toBe(orientation === "horizontal" ? "row" : "column");
      expect(host.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(2);
      const handle = one(host, '[data-slot="resizable-handle"]');
      expect(handle.el.getAttribute("role")).toBe("separator");
      expect(handle.el.getAttribute("aria-orientation")).toBe(orientation === "horizontal" ? "vertical" : "horizontal");
      expect(handle.el.getAttribute("data-separator")).toBe("disabled");
      expect(handle.el.getAttribute("aria-disabled")).toBe("true");
    }
  });
  test("the 1 px rule has an 8 px hit area and uses v4 hover and active inks", () => {
    const handle = one(server(resizable("horizontal")), '[data-slot="resizable-handle"]');
    expect(handle.el.getAttribute("data-separator")).toBe("inactive");
    expect(handle.classes).toEqual(
      expect.arrayContaining([
        "w-px",
        "bg-border",
        "after:w-2",
        "aria-[orientation=horizontal]:h-px",
        "aria-[orientation=horizontal]:after:h-2",
        "data-[separator=hover]:bg-primary",
        "data-[separator=active]:bg-primary",
      ]),
    );
  });
  test("plain handles use a zero-offset ring; grips take an inside ring in a 6 by 16 px box", () => {
    const plain = one(server(resizable("horizontal")), '[data-slot="resizable-handle"]');
    expect(plain.classes).toEqual(
      expect.arrayContaining([
        "focus-visible:bg-primary",
        "focus-visible:outline-2",
        "focus-visible:outline-offset-0",
        "focus-visible:outline-(--ring)",
      ]),
    );
    const handle = one(server(resizable("vertical", true)), '[data-slot="resizable-handle"]');
    expect(handle.classes).toContain("focus-visible:outline-0");
    const grip = one(handle.el, "div");
    expect(grip.classes).toEqual(
      expect.arrayContaining([
        "w-1.5",
        "h-4",
        "border",
        "border-input",
        "bg-background",
        "group-focus-visible/resizable-handle:outline-2",
        "group-focus-visible/resizable-handle:-outline-offset-2",
        "group-focus-visible/resizable-handle:outline-(--ring)",
      ]),
    );
    expect(grip.el.children).toHaveLength(2);
    for (const line of grip.el.children)
      expect(line.className.split(" ")).toEqual(expect.arrayContaining(["w-px", "bg-input"]));
  });
  test("no texture or forbidden class in either orientation with or without a grip", () => {
    clean(
      [
        server(resizable("horizontal")),
        server(resizable("vertical", true)),
        server(resizable("horizontal", true, true)),
      ],
      "resizable",
    );
  });
});
