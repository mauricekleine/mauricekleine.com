import { useSyncExternalStore } from "react";
import { useIsMobile } from "@/components/superthread/hooks/use-mobile";

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// the window's width, or null while the page is still the prerendered markup
function useWindowWidth(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => null,
  );
}

// The hook's value beside the window's width, both live: resize the window across 768 px and the value flips.
export function UseMobileExample() {
  const isMobile = useIsMobile();
  const width = useWindowWidth();
  return (
    <>
      <dl className="st-pass-readout">
        <dt>useIsMobile()</dt>
        <dd>{String(isMobile)}</dd>
        <dt>window</dt>
        <dd>{width === null ? "not measured yet" : `${width} px wide`}</dd>
      </dl>
      <p className="st-pass-hint">resize the window across 768 px and the value flips.</p>
    </>
  );
}
