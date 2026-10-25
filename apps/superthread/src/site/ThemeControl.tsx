import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { applyTheme, chooseTheme, readChoice, themeKey, type ThemeChoice } from "./theme-script";

const choices: readonly ThemeChoice[] = ["light", "dark", "auto"];

// One store for every mode control on the page. The choice in force lives on <html> as data-theme-choice: the inline
// script set it from storage before React ran, and every choice made here sets it again, whether or not storage takes
// the write. The store reads it from there and re-applies auto when the system mode changes. Storage is read again
// only when another tab writes it.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const getChoice = () => (document.documentElement.getAttribute("data-theme-choice") as ThemeChoice | null) ?? "auto";

function attach() {
  const system = matchMedia("(prefers-color-scheme: dark)");
  // the choice in force, never storage: with storage blocked, a choice made on this page lives only on <html>
  const onSystem = () => {
    if (getChoice() === "auto") applyTheme("auto");
    notify();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== themeKey) return;
    applyTheme(readChoice());
    notify();
  };
  system.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    system.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

let detach: (() => void) | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  detach ??= attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detach?.();
      detach = null;
    }
  };
}

// null until hydration: the prerendered markup cannot know the stored choice, so its pressed look comes from CSS on
// html[data-theme-choice] (shell.css) and aria-checked follows once React runs
export function useThemeChoice(): ThemeChoice | null {
  return useSyncExternalStore(subscribe, getChoice, () => null);
}

export function setThemeChoice(choice: ThemeChoice) {
  chooseTheme(choice);
  notify();
}

// The light, dark and auto control: a radio group of three buttons. Arrow keys move and choose, as in any radio
// group; Tab lands on the current choice.
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
    const current = choices.indexOf(choice ?? "auto");
    const next = choices[(current + step + choices.length) % choices.length];
    setThemeChoice(next);
    group.current?.querySelector<HTMLButtonElement>(`[data-theme-option="${next}"]`)?.focus();
  }

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label="mode"
      onKeyDown={onKeyDown}
      className={cn("st-mode", compact && "st-mode-compact", className)}
    >
      {choices.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          data-theme-option={option}
          aria-checked={choice === option}
          tabIndex={choice === null || choice === option ? 0 : -1}
          onClick={() => setThemeChoice(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
