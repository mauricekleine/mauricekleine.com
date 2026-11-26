import { useEffect, useRef, type KeyboardEvent } from "react";
import { setThemeChoice, useThemeChoice, type ThemeChoice } from "@/components/superthread/lib/theme";
import { cn } from "@/components/superthread/lib/utils";

const choices: readonly { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

// The light, dark and auto control: a radio group of three buttons. Arrow keys move and choose, as in any radio
// group; Tab lands on the current choice. Before hydration its pressed look comes from CSS on html[data-theme-choice]
// (shell.css), and aria-checked follows once React runs.
export function ThemeControl({ className, compact = false }: { className?: string; compact?: boolean }) {
  const choice = useThemeChoice();
  const group = useRef<HTMLDivElement>(null);

  // the mode can also change from another tab; keep the focused option in step
  useEffect(() => {
    const focused = group.current?.querySelector<HTMLButtonElement>("button:focus");
    if (focused && choice && focused.dataset.themeOption !== choice)
      group.current?.querySelector<HTMLButtonElement>(`[data-theme-option="${choice}"]`)?.focus();
  }, [choice]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const current = choices.findIndex((item) => item.value === (choice ?? "auto"));
    const next = choices[(current + step + choices.length) % choices.length].value;
    setThemeChoice(next);
    group.current?.querySelector<HTMLButtonElement>(`[data-theme-option="${next}"]`)?.focus();
  }

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label="Mode"
      onKeyDown={onKeyDown}
      className={cn("st-mode", compact && "st-mode-compact", className)}
    >
      {choices.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          data-theme-option={value}
          aria-checked={choice === value}
          tabIndex={choice === null || choice === value ? 0 : -1}
          onClick={() => setThemeChoice(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
