import { useEffect, useState } from "react";
import { isPageKey } from "@/components/superthread/lib/hotkey";
import { Input } from "@/components/superthread/ui/input";

// Counts the key on the page, and the field beside it shows the same key staying a letter.
export function HotkeyExample() {
  const [presses, setPresses] = useState(0);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isPageKey(event, "n")) setPresses((count) => count + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <>
      <dl className="st-pass-readout">
        <dt>n on the page</dt>
        <dd>{presses}</dd>
      </dl>
      <Input aria-label="type an n here" placeholder="type an n here" />
      <p className="st-pass-hint">both copies on this page count together.</p>
    </>
  );
}
