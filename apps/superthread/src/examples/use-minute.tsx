import { useMinute } from "@/components/superthread/hooks/use-minute";
import { clockWords } from "@/components/superthread/lib/time-words";

// The hook's two values, live on the reader's clock. The prerendered page has no clock, so it prints the same words
// wherever it's built.
export function UseMinuteExample() {
  const minute = useMinute();
  return (
    <>
      <dl className="st-pass-readout">
        <dt>Now</dt>
        <dd>{minute ? clockWords(minute.now) : "Not read yet"}</dd>
        <dt>Day</dt>
        <dd>{minute?.day ?? "Not read yet"}</dd>
      </dl>
      <p className="st-pass-hint">Both copies on this page turn over together, on one timer.</p>
    </>
  );
}
