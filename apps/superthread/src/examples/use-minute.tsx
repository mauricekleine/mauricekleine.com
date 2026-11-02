import { useMinute } from "@/components/superthread/hooks/use-minute";
import { clockWords } from "@/components/superthread/lib/time-words";

// The hook's two values, live on the reader's clock. The prerendered page has no clock, so it prints the same words
// wherever it's built.
export function UseMinuteExample() {
  const minute = useMinute();
  return (
    <>
      <dl className="st-pass-readout">
        <dt>now</dt>
        <dd>{minute ? clockWords(minute.now) : "not read yet"}</dd>
        <dt>day</dt>
        <dd>{minute?.day ?? "not read yet"}</dd>
      </dl>
      <p className="st-pass-hint">both copies on this page turn over together, on one timer.</p>
    </>
  );
}
