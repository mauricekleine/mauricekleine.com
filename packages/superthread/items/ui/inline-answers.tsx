import { createContext, type ReactNode, type RefObject, useContext, useId, useRef, useState } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)";

// An answer is a word in running text: foreground, underlined at rest. On a phone it's a 44 px box in a row of 44 px boxes,
// so its target is its own and a second row sits a whole target below the first.
const ANSWER =
  "inline-flex shrink-0 items-center type-ui whitespace-nowrap text-foreground underline decoration-1 underline-offset-4 hover:decoration-2 disabled:text-muted-foreground disabled:no-underline [@media(max-width:600px)]:h-11 [@media(max-width:600px)]:min-w-11";

type Answers = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  trigger: RefObject<HTMLButtonElement | null>;
  triggerId: string;
  listId: string;
};

const AnswersContext = createContext<Answers | null>(null);

function useAnswers() {
  const answers = useContext(AnswersContext);
  if (!answers) throw new Error("the parts of inline answers go inside InlineAnswers");
  return answers;
}

// A suggestion that takes correction in its own slot: the trigger swaps the line for plain answers there, and nothing else
// on the page moves. The slot belongs to the parent, so the swap holds the height the parent holds. Open, the row sits on
// the line's first row, and a phone's taller row reaches past the line evenly. Key it to the suggestion, so a new one
// starts closed.
function InlineAnswers({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [held, setHeld] = useState(defaultOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const listId = useId();
  const open = openProp ?? held;

  function change(next: boolean) {
    setHeld(next);
    onOpenChange?.(next);
  }

  const close = () => {
    change(false);
    trigger.current?.focus();
  };

  return (
    <AnswersContext.Provider value={{ open, toggle: () => change(!open), close, trigger, triggerId, listId }}>
      <div
        data-slot="inline-answers"
        data-mk="inline-answers"
        data-open={open ? "" : undefined}
        className={cn(
          "min-w-0 data-open:flex data-open:min-h-lh data-open:flex-wrap data-open:items-center data-open:gap-x-6 [@media(max-width:600px)]:data-open:mt-[calc((1lh-44px)/2)] [@media(max-width:600px)]:data-open:gap-x-4",
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (open && event.key === "Escape" && !event.defaultPrevented) close();
        }}
        {...props}
      />
    </AnswersContext.Provider>
  );
}

// The line the answers replace. The word space after it sets the trigger off, and lets the trigger start flush when it
// wraps.
function InlineAnswersLine({ ...props }: React.ComponentProps<"span">) {
  const { open } = useAnswers();
  return (
    <>
      <span data-slot="inline-answers-line" hidden={open} {...props} />{" "}
    </>
  );
}

// `wrong?` beside the line, a muted word underlined at rest. Open, it leads the answers at their step, and it closes them.
function InlineAnswersTrigger({ children = "wrong?", className, onClick, ...props }: React.ComponentProps<"button">) {
  const { open, toggle, trigger, triggerId, listId } = useAnswers();
  return (
    <button
      type="button"
      data-slot="inline-answers-trigger"
      className={cn(
        "relative type-instrument whitespace-nowrap text-muted-foreground underline decoration-1 underline-offset-4 transition-[color] duration-(--duration-instant) ease-(--ease-brand) hover:text-foreground aria-expanded:type-ui aria-expanded:no-underline [@media(max-width:600px)]:hit-area [@media(max-width:600px)]:aria-expanded:h-11",
        FOCUS,
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...props}
      ref={trigger}
      id={triggerId}
      aria-expanded={open}
      aria-controls={listId}
    >
      {children}
    </button>
  );
}

// The answers, as the row's own items, named by the trigger. They mount with it open, so a question they asked starts
// closed the next time.
function InlineAnswersList({ className, children, ...props }: React.ComponentProps<"span">) {
  const { open, triggerId, listId } = useAnswers();
  return (
    <span
      data-slot="inline-answers-list"
      className={cn("contents", className)}
      {...props}
      id={listId}
      role="group"
      aria-labelledby={triggerId}
      hidden={!open}
    >
      {open && children}
    </span>
  );
}

// One plain answer. Choosing it closes the answers and hands focus back to the trigger, unless onClick prevents default.
// The answers can land under the pointer, so the second click of a double click counts for nothing.
function InlineAnswer({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { close } = useAnswers();
  return (
    <button
      type="button"
      data-slot="inline-answer"
      className={cn(ANSWER, FOCUS, className)}
      onClick={(event) => {
        if (event.detail > 1) return;
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
      {...props}
    />
  );
}

// An answer that asks one more question there: its word stays as the lead-in that closes the question, and the question's
// own answers follow its arrow, whole, on the row or the row below. They're InlineAnswer, and choosing one closes
// everything.
function InlineAnswersAsk({
  question,
  defaultOpen = false,
  children,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  question: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [asking, setAsking] = useState(defaultOpen);
  const askId = useId();
  const answersId = useId();
  return (
    <>
      <button
        type="button"
        data-slot="inline-answers-ask"
        className={cn(ANSWER, "aria-expanded:no-underline", FOCUS, className)}
        onClick={(event) => {
          if (event.detail > 1) return;
          onClick?.(event);
          if (!event.defaultPrevented) setAsking(!asking);
        }}
        {...props}
        id={askId}
        aria-expanded={asking}
        aria-controls={answersId}
      >
        {question}
      </button>
      <span
        data-slot="inline-answers-asked"
        id={answersId}
        role="group"
        aria-labelledby={askId}
        hidden={!asking}
        className="inline-flex items-center gap-x-6 [@media(max-width:600px)]:gap-x-4"
      >
        <Icon name="arrow" className="shrink-0 text-muted-foreground" />
        {children}
      </span>
    </>
  );
}

export { InlineAnswers, InlineAnswersLine, InlineAnswersTrigger, InlineAnswersList, InlineAnswer, InlineAnswersAsk };
