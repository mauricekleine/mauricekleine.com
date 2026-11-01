import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { setThemeChoice, useThemeChoice, type ThemeChoice } from "@/components/superthread/lib/theme";
import { cn } from "@/components/superthread/lib/utils";

export type PageSection = { id: string; title: string };
type Place = "home" | "about" | "essays";

const places: { id: Place; label: string; href: string }[] = [
  { id: "home", label: "home", href: "/" },
  { id: "about", label: "about", href: "/about" },
  { id: "essays", label: "essays", href: "/essays" },
];
const choices: readonly ThemeChoice[] = ["light", "dark", "auto"];

// The light, dark and auto control, the superthread site's: a radio group whose arrow keys move and choose. Before
// hydration its pressed look comes from CSS on html[data-theme-choice], so the prerendered page never shows the wrong
// one.
function ModeControl({ compact = false }: { compact?: boolean }) {
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
      className={cn("mk-mode", compact && "mk-mode-compact")}
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

// "on this page": the top, then the page's sections. The current entry follows the scroll.
function OnThisPage({ sections }: { sections: PageSection[] }) {
  const [current, setCurrent] = useState("top");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((target): target is HTMLElement => target !== null);
    function onScroll() {
      // the last section whose top has passed a third of the way down the window
      const line = window.innerHeight / 3;
      let id = "top";
      for (const target of targets) if (target.getBoundingClientRect().top <= line) id = target.id;
      setCurrent(id);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <aside className="mk-aside">
      <nav className="mk-toc" aria-label="on this page">
        <p className="type-meta">on this page</p>
        <ul>
          {[{ id: "top", title: "top" }, ...sections].map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} aria-current={link.id === current ? "location" : undefined}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// The page frame, the superthread site's: the masthead across the top, then the nav, the page and the aside in three
// columns divided by 1 px rules. Pages are plain documents, so nav links are plain anchors and the sky starts fresh on
// each. `interactive` is off on the lost page, which ships no client entry: its mode still applies, but a control
// nothing runs would be a lie.
export function Shell({
  place,
  crumb,
  title,
  sections,
  interactive = true,
  children,
}: {
  place?: Place;
  crumb: string;
  title: string;
  sections?: PageSection[];
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <a href="#main" className="mk-skip">
        skip to the page
      </a>
      <header className="mk-mast">
        <a href="/" className="mk-brand">
          maurice kleine
        </a>
        <div className="mk-crumb">
          <span className="type-meta">{crumb}</span>
          <span className="type-meta" aria-hidden="true">
            /
          </span>
          <b>{title}</b>
        </div>
        <dl className="mk-meta">
          <dt className="type-meta">status</dt>
          <dd>
            <span className="status-dot" aria-hidden="true"></span> operational
          </dd>
          <dt className="type-meta">sleep</dt>
          <dd>degraded</dd>
          <dt className="type-meta">ideas</dt>
          <dd>backlogged</dd>
        </dl>
        {interactive && (
          <div className="mk-mast-mode">
            <ModeControl compact />
          </div>
        )}
      </header>
      <div className={cn("mk-body", !sections && "mk-body-solo")}>
        <nav className="mk-nav" aria-label="site">
          <ul className="mk-nav-list">
            {places.map(({ id, label, href }) => (
              <li key={id}>
                <a href={href} aria-current={id === place ? "page" : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {interactive && (
            <div className="mk-nav-foot">
              <ModeControl />
            </div>
          )}
        </nav>
        <main id="main" className="mk-main" tabIndex={-1}>
          <div className="mk-page">{children}</div>
        </main>
        {sections && <OnThisPage sections={sections} />}
      </div>
    </>
  );
}
