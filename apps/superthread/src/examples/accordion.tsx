import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/superthread/ui/accordion";
import { State, States } from "@/examples/input";
const rows = [
  ["What does Orbit keep?", "Each run keeps its task, result and log. Open a run to follow its progress."],
  [
    "When does Quanta publish?",
    "A chapter stays in draft until you publish it. The next build updates the reading page.",
  ],
  ["Can I retry a failed build?", "Yes. Open the build log, fix the failing step and start another run."],
];
export function AccordionExample({ multiple = false }: { multiple?: boolean }) {
  return (
    <Accordion multiple={multiple} defaultValue={[0]}>
      {rows.map(([title, body], i) => (
        <AccordionItem key={title} value={i}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>
            <p>{body}</p>
            <a href="/components/collapsible">See a single disclosure</a>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
export function AccordionStates() {
  return (
    <States>
      {(
        [
          ["closed", "Closed", "48 px row between rules"],
          ["open", "Open", "Chevron turns; panel opens"],
          ["hover", "Hover", "Underlined trigger"],
          ["focus", "Focus", "Ring inside the full row"],
          ["disabled", "Disabled", "Disabled label and trigger"],
        ] as const
      ).map(([state, name, note]) => (
        <State key={state} name={name} note={note}>
          <div inert>
            <Accordion value={state === "open" ? [0] : []}>
              <AccordionItem value={0} disabled={state === "disabled"}>
                <AccordionTrigger tabIndex={-1} data-demo={state === "focus" ? "focus-visible" : state}>
                  Run details
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
