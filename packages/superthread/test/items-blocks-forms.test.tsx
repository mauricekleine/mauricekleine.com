import { describe, expect, test } from "bun:test";
import { act, useState } from "react";
import {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
} from "@/components/superthread/blocks/form-section";
import { QuickAdd } from "@/components/superthread/blocks/quick-add";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { Notice, NoticeTitle, NoticeDescription, NoticeActions } from "@/components/superthread/blocks/notice";
import { Button } from "@/components/superthread/ui/button";
import { Field, FieldLabel } from "@/components/superthread/ui/field";
import { Input } from "@/components/superthread/ui/input";
import { type StatusState } from "@/components/superthread/ui/glyphs";
import { client, detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

// Exercise the actual text control and native form boundary, shared by Enter and the submit button.
async function type(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function submit(form: HTMLFormElement) {
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

function Settings() {
  const [status, setStatus] = useState("unsaved changes");
  return (
    <FormSection
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("saved");
      }}
      onReset={() => setStatus("discarded")}
    >
      <FormSectionHeader>
        <FormSectionTitle>settings</FormSectionTitle>
        <FormSectionDescription>new runs use these settings.</FormSectionDescription>
      </FormSectionHeader>
      <FormSectionFields>
        <Field>
          <FieldLabel htmlFor="prefix">branch prefix</FieldLabel>
          <Input id="prefix" defaultValue="agent/" />
        </Field>
      </FormSectionFields>
      <FormSectionFooter>
        <FormSectionStatus>{status}</FormSectionStatus>
        <Button type="reset" variant="outline">
          discard
        </Button>
        <Button type="submit">save</Button>
      </FormSectionFooter>
    </FormSection>
  );
}

describe("form section", () => {
  test("the form is named by its title, with description, fields and a live save row", () => {
    const rendered = server(<Settings />);
    const form = one(rendered, "form").el;
    expect(form.getAttribute("data-mk")).toBe("form-section");
    const title = one(rendered, "h2").el;
    expect(form.getAttribute("aria-labelledby")).toBe(title.id);
    expect(title.textContent).toBe("settings");
    expect(one(rendered, '[data-slot="form-section-description"]').el.textContent).toBe("new runs use these settings.");
    expect(one(rendered, '[data-slot="form-section-fields"] input').el.id).toBe("prefix");
    expect(one(rendered, '[data-slot="form-section-status"]').el.getAttribute("aria-live")).toBe("polite");
    expect(one(rendered, 'button[type="submit"]').el.textContent).toBe("save");
    expect(one(rendered, 'button[type="reset"]').el.textContent).toBe("discard");
  });

  test("two titled forms have distinct names and keep custom element props", () => {
    const rendered = server(
      <>
        <Settings />
        <Settings />
        <FormSection aria-label="preferences" className="max-w-xl" data-example="custom">
          <FormSectionTitle>preferences</FormSectionTitle>
        </FormSection>
      </>,
    );
    const forms = [...rendered.querySelectorAll("form")];
    expect(forms[0]!.getAttribute("aria-labelledby")).not.toBe(forms[1]!.getAttribute("aria-labelledby"));
    expect(forms[2]!.getAttribute("aria-label")).toBe("preferences");
    expect(forms[2]!.getAttribute("data-example")).toBe("custom");
    expect(forms[2]!.classList.contains("max-w-xl")).toBe(true);
  });

  test("save and discard stay app-owned and update the announced status", async () => {
    const view = await client(<Settings />);
    try {
      await submit(one(view.body, "form").el as HTMLFormElement);
      expect(one(view.body, '[aria-live="polite"]').el.textContent).toBe("saved");
      await act(async () => {
        (one(view.body, "form").el as HTMLFormElement).reset();
      });
      expect(one(view.body, '[aria-live="polite"]').el.textContent).toBe("discarded");
    } finally {
      await view.done();
    }
  });
});

describe("quick add", () => {
  test("server renders a named form, visible label and an empty disabled submit", () => {
    const rendered = server(<QuickAdd label="new task" placeholder="what needs doing?" onAdd={() => {}} />);
    const form = one(rendered, "form").el;
    const input = one(rendered, "input").el;
    expect(form.getAttribute("data-mk")).toBe("quick-add");
    expect(form.getAttribute("aria-label")).toBe("new task");
    expect(one(rendered, "label").el.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("placeholder")).toBe("what needs doing?");
    expect(one(rendered, "button").el.getAttribute("type")).toBe("submit");
    expect(one(rendered, "button").el.hasAttribute("disabled")).toBe(true);
    expect(one(rendered, "button").el.textContent).toBe("add");
    expect(one(rendered, "button svg").el.getAttribute("aria-hidden")).toBe("true");
  });

  test("a hidden label still names the field and email attributes pass through", () => {
    const rendered = server(
      <QuickAdd
        label="email"
        hideLabel
        submitLabel="subscribe"
        inputProps={{ id: "email", type: "email", name: "email", required: true, autoComplete: "email" }}
        onAdd={() => {}}
      />,
    );
    expect(one(rendered, "label").classes).toContain("sr-only");
    expect(one(rendered, "label").el.getAttribute("for")).toBe("email");
    expect(one(rendered, "input").el.getAttribute("type")).toBe("email");
    expect(one(rendered, "input").el.hasAttribute("required")).toBe(true);
    expect(one(rendered, "input").el.getAttribute("name")).toBe("email");
    expect(one(rendered, "button").el.textContent).toBe("subscribe");
  });

  test("blank and whitespace submissions do nothing", async () => {
    const added: string[] = [];
    const view = await client(
      <QuickAdd
        label="new task"
        onAdd={(value) => {
          added.push(value);
        }}
      />,
    );
    try {
      const form = one(view.body, "form").el as HTMLFormElement;
      await submit(form);
      await type(one(view.body, "input").el as HTMLInputElement, "  \n ");
      await submit(form);
      expect(added).toEqual([]);
      expect(one(view.body, "button").el.hasAttribute("disabled")).toBe(true);
    } finally {
      await view.done();
    }
  });

  test("submits trimmed text, clears the field and keeps input focus", async () => {
    const added: string[] = [];
    const view = await client(
      <QuickAdd
        label="new task"
        onAdd={(value) => {
          added.push(value);
        }}
      />,
    );
    try {
      const input = one(view.body, "input").el as HTMLInputElement;
      await type(input, "  write a draft  ");
      expect(one(view.body, "button").el.hasAttribute("disabled")).toBe(false);
      await submit(one(view.body, "form").el as HTMLFormElement);
      expect(added).toEqual(["write a draft"]);
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
      expect(one(view.body, "form").el.getAttribute("aria-busy")).toBe("false");
    } finally {
      await view.done();
    }
  });

  test("pending adds disable the submit, announce busy and cannot be duplicated", async () => {
    let finish!: () => void;
    const added: string[] = [];
    const view = await client(
      <QuickAdd
        label="new task"
        onAdd={(value) => {
          added.push(value);
          return new Promise<void>((resolve) => {
            finish = resolve;
          });
        }}
      />,
    );
    try {
      const form = one(view.body, "form").el as HTMLFormElement;
      const input = one(view.body, "input").el as HTMLInputElement;
      await type(input, "first task");
      await submit(form);
      expect(form.getAttribute("aria-busy")).toBe("true");
      expect(one(view.body, "button").el.hasAttribute("disabled")).toBe(true);
      await submit(form);
      expect(added).toEqual(["first task"]);
      await act(async () => finish());
      expect(form.getAttribute("aria-busy")).toBe("false");
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
    } finally {
      await view.done();
    }
  });

  test("success preserves a newer draft entered while an add was pending", async () => {
    let finish!: () => void;
    const view = await client(
      <QuickAdd
        label="new task"
        onAdd={() =>
          new Promise<void>((resolve) => {
            finish = resolve;
          })
        }
      />,
    );
    try {
      const input = one(view.body, "input").el as HTMLInputElement;
      await type(input, "first task");
      await submit(one(view.body, "form").el as HTMLFormElement);
      await type(input, "next task");
      await act(async () => finish());
      expect(input.value).toBe("next task");
    } finally {
      await view.done();
    }
  });

  test.each([false, true])(
    "a %s async failure retains the draft and associates the error, then allows retry",
    async (asyncFailure) => {
      let attempts = 0;
      const view = await client(
        <QuickAdd
          label="new task"
          inputProps={{ "aria-describedby": "task-hint" }}
          onAdd={() => {
            attempts++;
            if (attempts === 1) {
              if (asyncFailure) return Promise.reject(new Error("could not save"));
              throw new Error("could not save");
            }
          }}
        />,
      );
      try {
        const input = one(view.body, "input").el as HTMLInputElement;
        await type(input, "keep this task");
        await submit(one(view.body, "form").el as HTMLFormElement);
        const alert = one(view.body, '[role="alert"]').el;
        expect(alert.getAttribute("data-slot")).toBe("field-error");
        expect(alert.textContent).toBe("could not save");
        expect(input.value).toBe("keep this task");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe(`task-hint ${alert.id}`);
        expect(one(view.body, "button").el.hasAttribute("disabled")).toBe(false);
        await submit(one(view.body, "form").el as HTMLFormElement);
        expect(attempts).toBe(2);
        expect(input.value).toBe("");
        expect(view.body.querySelector('[role="alert"]')).toBeNull();
        expect(input.getAttribute("aria-describedby")).toBe("task-hint");
      } finally {
        await view.done();
      }
    },
  );

  test("an empty thrown error gets a useful default message", async () => {
    const view = await client(
      <QuickAdd
        label="new task"
        onAdd={() => {
          throw new Error();
        }}
      />,
    );
    try {
      await type(one(view.body, "input").el as HTMLInputElement, "task");
      await submit(one(view.body, "form").el as HTMLFormElement);
      expect(one(view.body, '[role="alert"]').el.textContent).toBe("could not add. try again.");
    } finally {
      await view.done();
    }
  });
});

describe("facts", () => {
  test.each(["list", "grid"] as const)(
    "%s keeps semantic pairs and marks ids and numbers without treating prose as data",
    (layout) => {
      const rendered = server(
        <Facts layout={layout} columns={3} aria-label="run details">
          <Fact>
            <FactLabel>run</FactLabel>
            <FactValue kind="id">r-12</FactValue>
          </Fact>
          <Fact>
            <FactLabel>attempts</FactLabel>
            <FactValue kind="number">2</FactValue>
          </Fact>
          <Fact>
            <FactLabel>ship</FactLabel>
            <FactValue>orbit</FactValue>
          </Fact>
        </Facts>,
      );
      const dl = one(rendered, "dl").el;
      expect(dl.getAttribute("data-mk")).toBe("facts");
      expect(dl.getAttribute("data-layout")).toBe(layout);
      expect(dl.getAttribute("data-columns")).toBe("3");
      expect([...dl.children].map((pair) => [...pair.children].map((part) => part.tagName))).toEqual([
        ["DT", "DD"],
        ["DT", "DD"],
        ["DT", "DD"],
      ]);
      expect(one(rendered, '[data-kind="id"]').el.textContent).toBe("r-12");
      expect(one(rendered, '[data-kind="number"]').el.textContent).toBe("2");
      expect(rendered.querySelectorAll("dd:not([data-kind])")).toHaveLength(1);
    },
  );

  test("defaults to a list and two grid columns, and allows custom pair contents", () => {
    const rendered = server(
      <Facts>
        <Fact className="custom-pair">
          <FactLabel>source</FactLabel>
          <FactValue>
            <a href="/runs">runs</a>
          </FactValue>
        </Fact>
      </Facts>,
    );
    expect(one(rendered, "dl").el.getAttribute("data-layout")).toBe("list");
    expect(one(rendered, "dl").el.getAttribute("data-columns")).toBe("2");
    expect(one(rendered, "a").el.getAttribute("href")).toBe("/runs");
    expect(one(rendered, '[data-slot="fact"]').classes).toContain("custom-pair");
  });
});

describe("notice", () => {
  test.each([undefined, "done", "running", "waiting", "failed", "queued"] as const)(
    "%s announces with the correct urgency and keeps status ink in its glyph",
    (state: StatusState | undefined) => {
      const rendered = server(
        <Notice state={state}>
          <NoticeTitle>sync update</NoticeTitle>
          <NoticeDescription>your draft is kept here.</NoticeDescription>
          <NoticeActions>
            <Button variant="outline">try again</Button>
          </NoticeActions>
        </Notice>,
      );
      const notice = one(rendered, '[data-mk="notice"]');
      expect(notice.el.getAttribute("role")).toBe(state === "failed" ? "alert" : "status");
      expect(one(rendered, '[data-slot="notice-title"]').el.textContent).toBe("sync update");
      expect(one(rendered, '[data-slot="notice-description"]').el.textContent).toBe("your draft is kept here.");
      expect(notice.classes).toEqual(expect.arrayContaining(["border", "border-border", "p-4"]));
      expect(notice.classes.some((cls) => /(?:bg|border)-(?:success|info|warning|error|neutral)/.test(cls))).toBe(
        false,
      );
      const glyph = one(rendered, '[data-slot="notice-glyph"] svg').el;
      expect(glyph.getAttribute("aria-label")).toBe(state ?? null);
      expect(one(rendered, "button").el.textContent).toBe("try again");
    },
  );

  test("notice actions keep the app's handlers", async () => {
    let retried = false;
    const view = await client(
      <Notice state="failed">
        <NoticeDescription>could not sync.</NoticeDescription>
        <NoticeActions>
          <Button
            onClick={() => {
              retried = true;
            }}
          >
            try again
          </Button>
        </NoticeActions>
      </Notice>,
    );
    try {
      await act(async () => (one(view.body, "button").el as HTMLButtonElement).click());
      expect(retried).toBe(true);
    } finally {
      await view.done();
    }
  });
});

test("the forms blocks add no texture detail or forbidden classes of their own", () => {
  const fixtures = [
    ["form-section", <Settings />],
    ["quick-add", <QuickAdd label="new task" onAdd={() => {}} />],
    [
      "facts",
      <Facts>
        <Fact>
          <FactLabel>run</FactLabel>
          <FactValue kind="id">r-12</FactValue>
        </Fact>
      </Facts>,
    ],
    [
      "notice",
      <Notice state="failed">
        <NoticeTitle>sync stopped</NoticeTitle>
        <NoticeDescription>draft kept here.</NoticeDescription>
        <NoticeActions>
          <Button>try again</Button>
        </NoticeActions>
      </Notice>,
    ],
  ] as const;
  for (const [name, fixture] of fixtures) {
    // The primitive suites own the seeds being skinned alongside this work. This checks the block's slots only.
    const rendered = elements(server(fixture)).filter(({ el }) =>
      el.getAttribute("data-slot")?.startsWith(name === "facts" ? "fact" : name),
    );
    expect(detailsUsed(rendered, name), name).toEqual([]);
    expect(forbidden(rendered), name).toEqual([]);
  }
});
