// Inline answers: a suggestion that takes correction in its own slot. These drive the item the way a reader does, and
// happy-dom lays nothing out, so the phone's 44 px boxes are read from their classes.
import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, useState } from "react";
import {
  InlineAnswer,
  InlineAnswers,
  InlineAnswersAsk,
  InlineAnswersLine,
  InlineAnswersList,
  InlineAnswersTrigger,
} from "@/components/superthread/ui/inline-answers";
import { client, CONTROL_RING, elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const ROOT = '[data-slot="inline-answers"]';
const LINE = '[data-slot="inline-answers-line"]';
const TRIGGER = '[data-slot="inline-answers-trigger"]';
const LIST = '[data-slot="inline-answers-list"]';
const ASK = '[data-slot="inline-answers-ask"]';
const ASKED = '[data-slot="inline-answers-asked"]';

function Answers({
  onAnswer,
  ...root
}: Omit<React.ComponentProps<typeof InlineAnswers>, "children"> & {
  onAnswer?: (answer: string, event: React.MouseEvent) => void;
}) {
  const answer = (word: string) => (event: React.MouseEvent) => onAnswer?.(word, event);
  return (
    <InlineAnswers {...root}>
      <InlineAnswersLine>the next draft waits on your answer.</InlineAnswersLine>
      <InlineAnswersTrigger />
      <InlineAnswersList>
        <InlineAnswer onClick={answer("already done")}>already done</InlineAnswer>
        <InlineAnswer onClick={answer("not mine")}>not mine</InlineAnswer>
        <InlineAnswersAsk question="wrong day">
          <InlineAnswer onClick={answer("tomorrow")}>tomorrow</InlineAnswer>
          <InlineAnswer onClick={answer("next week")}>next week</InlineAnswer>
        </InlineAnswersAsk>
      </InlineAnswersList>
    </InlineAnswers>
  );
}

let cleanup: (() => Promise<void>) | undefined;
afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
});

async function live(node: React.ReactNode) {
  const { body, done } = await client(node);
  cleanup = done;
  return body;
}

const element = (host: ParentNode, selector: string) => one(host, selector).el as HTMLElement;
const press = (el: Element) => act(async () => (el as HTMLElement).click());
const pressAgain = (el: Element) =>
  act(async () => void el.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 2 })));
const answer = (host: ParentNode, word: string) =>
  [...host.querySelectorAll('[data-slot="inline-answer"]')].find((el) => el.textContent === word)!;
const isOpen = (host: ParentNode) => element(host, TRIGGER).getAttribute("aria-expanded") === "true";
// A boolean, because a failed match on two elements prints the whole of happy-dom.
const focused = (host: ParentNode) => document.activeElement === element(host, TRIGGER);

describe("the swap", () => {
  test("closed, it prints the line and the word that opens the answers, and holds no answer", () => {
    const host = server(<Answers />);
    expect(one(host, LINE).el.hasAttribute("hidden")).toBe(false);
    expect(one(host, TRIGGER).el.textContent).toBe("wrong?");
    expect(one(host, TRIGGER).el.getAttribute("aria-expanded")).toBe("false");
    expect(one(host, LIST).el.hasAttribute("hidden")).toBe(true);
    expect(host.querySelector('[data-slot="inline-answer"]')).toBeNull();
  });

  test("the trigger swaps the line for its answers, and stays as the lead-in that closes them", async () => {
    const host = await live(<Answers />);
    await press(element(host, TRIGGER));
    expect(element(host, LINE).hasAttribute("hidden")).toBe(true);
    expect(element(host, LIST).hasAttribute("hidden")).toBe(false);
    expect(element(host, TRIGGER).getAttribute("aria-expanded")).toBe("true");
    expect(host.querySelector('[data-slot="inline-answer"]')).not.toBeNull();
    await press(element(host, TRIGGER));
    expect(element(host, LINE).hasAttribute("hidden")).toBe(false);
    expect(host.querySelector('[data-slot="inline-answer"]')).toBeNull();
  });

  test("the trigger names the answers and points at them", () => {
    const host = server(<Answers defaultOpen />);
    const trigger = one(host, TRIGGER).el;
    const list = one(host, LIST).el;
    expect(list.getAttribute("role")).toBe("group");
    expect(list.getAttribute("aria-labelledby")).toBe(trigger.getAttribute("id"));
    expect(trigger.getAttribute("aria-controls")).toBe(list.getAttribute("id"));
  });

  test("a ship can name the trigger, and a click it prevents opens nothing", async () => {
    const host = await live(
      <InlineAnswers>
        <InlineAnswersLine>the line</InlineAnswersLine>
        <InlineAnswersTrigger onClick={(event) => event.preventDefault()}>not this?</InlineAnswersTrigger>
        <InlineAnswersList />
      </InlineAnswers>,
    );
    expect(element(host, TRIGGER).textContent).toBe("not this?");
    await press(element(host, TRIGGER));
    expect(isOpen(host)).toBe(false);
  });

  test("the parent can drive it: the state follows open, and a press only reports", async () => {
    const changed = mock((_open: boolean) => {});
    function Driven() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Answers
            open={open}
            onOpenChange={(next) => {
              changed(next);
              setOpen(next);
            }}
          />
          <button type="button" data-testid="drive" onClick={() => setOpen(true)} />
        </>
      );
    }
    const host = await live(<Driven />);
    expect(isOpen(host)).toBe(true);
    await press(element(host, TRIGGER));
    expect(changed).toHaveBeenLastCalledWith(false);
    expect(isOpen(host)).toBe(false);
    await press(element(host, '[data-testid="drive"]'));
    expect(isOpen(host)).toBe(true);
  });

  test("a parent that keeps open keeps it open", async () => {
    const host = await live(<Answers open />);
    await press(element(host, TRIGGER));
    expect(isOpen(host)).toBe(true);
  });
});

describe("an answer", () => {
  test("reports, closes the answers and hands focus back to the trigger", async () => {
    const heard = mock((_word: string) => {});
    const host = await live(<Answers defaultOpen onAnswer={(word) => heard(word)} />);
    await press(answer(host, "not mine"));
    expect(heard).toHaveBeenCalledWith("not mine");
    expect(isOpen(host)).toBe(false);
    expect(focused(host)).toBe(true);
  });

  test("handing focus back scrolls nothing, since a click moves nothing", async () => {
    const host = await live(<Answers defaultOpen />);
    const focus = mock((_options?: FocusOptions) => {});
    element(host, TRIGGER).focus = focus;
    await press(answer(host, "not mine"));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  test("one that prevents default keeps the answers open", async () => {
    const host = await live(<Answers defaultOpen onAnswer={(_, event) => event.preventDefault()} />);
    await press(answer(host, "not mine"));
    expect(isOpen(host)).toBe(true);
  });

  test("the second click of a double click counts for nothing", async () => {
    const heard = mock((_word: string) => {});
    const host = await live(<Answers defaultOpen onAnswer={(word) => heard(word)} />);
    await pressAgain(answer(host, "not mine"));
    expect(heard).not.toHaveBeenCalled();
    expect(isOpen(host)).toBe(true);
  });
});

describe("escape", () => {
  const escape = (el: Element) =>
    act(async () => void el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));

  test("closes everything and hands focus back to the trigger", async () => {
    const host = await live(<Answers defaultOpen />);
    await press(element(host, ASK));
    await escape(answer(host, "tomorrow"));
    expect(isOpen(host)).toBe(false);
    expect(focused(host)).toBe(true);
  });

  test("a key a ship handled stays handled", async () => {
    const host = await live(<Answers defaultOpen onKeyDown={(event) => event.preventDefault()} />);
    await escape(answer(host, "not mine"));
    expect(isOpen(host)).toBe(true);
  });

  test("a closed line leaves it to the page and keeps its hands off focus", async () => {
    const changed = mock((_open: boolean) => {});
    const host = await live(<Answers onOpenChange={changed} />);
    await escape(element(host, TRIGGER));
    expect(changed).not.toHaveBeenCalled();
    expect(focused(host)).toBe(false);
  });
});

describe("one more question", () => {
  test("opens in the same slot beside the answers, and its word closes it again", async () => {
    const host = await live(<Answers defaultOpen />);
    expect(element(host, ASK).getAttribute("aria-expanded")).toBe("false");
    expect(element(host, ASKED).hasAttribute("hidden")).toBe(true);
    await press(element(host, ASK));
    expect(element(host, ASKED).hasAttribute("hidden")).toBe(false);
    expect(element(host, ASK).getAttribute("aria-expanded")).toBe("true");
    expect(element(host, LIST).contains(element(host, ASKED))).toBe(true);
    expect(answer(host, "not mine")?.isConnected).toBe(true);
    await press(element(host, ASK));
    expect(element(host, ASKED).hasAttribute("hidden")).toBe(true);
    expect(isOpen(host)).toBe(true);
  });

  test("its word names its answers and points at them", () => {
    const host = server(<Answers defaultOpen />);
    const ask = one(host, ASK).el;
    const asked = one(host, ASKED).el;
    expect(asked.getAttribute("role")).toBe("group");
    expect(asked.getAttribute("aria-labelledby")).toBe(ask.getAttribute("id"));
    expect(ask.getAttribute("aria-controls")).toBe(asked.getAttribute("id"));
  });

  test("its answer closes everything, and the question starts closed the next time", async () => {
    const heard = mock((_word: string) => {});
    const host = await live(<Answers defaultOpen onAnswer={(word) => heard(word)} />);
    await press(element(host, ASK));
    await press(answer(host, "next week"));
    expect(heard).toHaveBeenCalledWith("next week");
    expect(isOpen(host)).toBe(false);
    await press(element(host, TRIGGER));
    expect(element(host, ASK).getAttribute("aria-expanded")).toBe("false");
  });

  test("the second click of a double click leaves the question as it was", async () => {
    const host = await live(<Answers defaultOpen />);
    await press(element(host, ASK));
    await pressAgain(element(host, ASK));
    expect(element(host, ASK).getAttribute("aria-expanded")).toBe("true");
  });
});

describe("the look", () => {
  const open = () => server(<Answers defaultOpen />);

  test("every answer is a 44 px box on a phone, on a row of its own rows", () => {
    const host = open();
    for (const selector of ['[data-slot="inline-answer"]', ASK])
      expect(one(host, selector).classes).toEqual(expect.arrayContaining([`${PHONE}h-11`, `${PHONE}min-w-11`]));
    expect(one(host, ROOT).classes).toEqual(
      expect.arrayContaining(["data-open:flex-wrap", `${PHONE}data-open:gap-x-4`]),
    );
  });

  test("the row sits on the line's first row, so its text stays where the line's was", () => {
    expect(one(open(), ROOT).classes).toEqual(
      expect.arrayContaining(["data-open:min-h-lh", `${PHONE}data-open:mt-[calc((1lh-44px)/2)]`]),
    );
  });

  test("the trigger reaches 44 px on a phone, as a hit area beside the line and a box as the row's lead-in", () => {
    expect(one(open(), TRIGGER).classes).toEqual(
      expect.arrayContaining(["relative", `${PHONE}hit-area`, `${PHONE}aria-expanded:h-11`]),
    );
  });

  test("the trigger is muted and underlined at rest, and an open lead-in sets its underline down", () => {
    expect(one(open(), TRIGGER).classes).toEqual(
      expect.arrayContaining([
        "text-muted-foreground",
        "underline",
        "type-instrument",
        "aria-expanded:type-ui",
        "aria-expanded:no-underline",
      ]),
    );
    expect(one(open(), ASK).classes).toEqual(expect.arrayContaining(["underline", "aria-expanded:no-underline"]));
  });

  test("an answer prints as a word in running text, and a disabled one by colour alone", () => {
    expect(one(open(), '[data-slot="inline-answer"]').classes).toEqual(
      expect.arrayContaining([
        "type-ui",
        "text-foreground",
        "underline",
        "decoration-1",
        "underline-offset-4",
        "disabled:text-muted-foreground",
      ]),
    );
  });

  test("every control shows the ring, and the item keeps the system's rules", () => {
    const host = open();
    for (const selector of [TRIGGER, ASK, '[data-slot="inline-answer"]'])
      expect(one(host, selector).classes).toEqual(expect.arrayContaining(CONTROL_RING));
    expect(forbidden(elements(host))).toEqual([]);
    expect(one(host, ROOT).el.getAttribute("data-mk")).toBe("inline-answers");
  });

  test("the group's box steps aside, so its answers are the row's own items and wrap with it", () => {
    expect(one(open(), LIST).classes).toContain("contents");
  });
});
