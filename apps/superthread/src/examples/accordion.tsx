import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/superthread/ui/accordion";
import { State, States } from "@/examples/input";
const rows = [
  ["what does orbit keep?", "each run keeps its task, result and log. open a run to follow its progress."],
  [
    "when does quanta publish?",
    "a chapter stays in draft until you publish it. the next build updates the reading page.",
  ],
  ["can i retry a failed build?", "yes. open the build log, fix the failing step and start another run."],
];
export function AccordionExample({ multiple = false }: { multiple?: boolean }) {
  return (
    <Accordion multiple={multiple} defaultValue={[0]}>
      {rows.map(([title, body], i) => (
        <AccordionItem key={title} value={i}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>
            <p>{body}</p>
            <a href="/components/collapsible">see a single disclosure</a>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
export function AccordionStates() {
  return (
    <States>
      {["closed", "open", "hover", "focus", "disabled"].map((state) => (
        <State
          key={state}
          name={state}
          note={
            state === "open"
              ? "chevron turns; panel opens"
              : state === "focus"
                ? "ring inside the full row"
                : state === "hover"
                  ? "underlined trigger"
                  : state === "disabled"
                    ? "disabled label and trigger"
                    : "48 px row between rules"
          }
        >
          <div inert>
            <Accordion value={state === "open" ? [0] : []}>
              <AccordionItem value={0} disabled={state === "disabled"}>
                <AccordionTrigger tabIndex={-1} data-demo={state === "focus" ? "focus-visible" : state}>
                  run details
                </AccordionTrigger>
                <AccordionContent>3 logs, 1 result.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </State>
      ))}
    </States>
  );
}
