import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { setThemeChoice, useThemeChoice, type ThemeChoice } from "@/components/superthread/lib/theme";
import { cn } from "@/components/superthread/lib/utils";

export type PageSection = { id: string; title: string };
type Place = "home" | "about" | "essays";

const places: { id: Place; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "essays", label: "Essays", href: "/essays" },
];
const choices: readonly { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

// The Light, Dark and Auto control, the superthread site's: a radio group whose arrow keys move and choose. Before
// hydration its pressed look comes from CSS on html[data-theme-choice], so the prerendered page never shows the wrong
// one.
function ModeControl({ compact = false }: { compact?: boolean }) {
  const choice = useThemeChoice();
  const group = useRef<HTMLDivElement>(null);

  // The mode can also change from another tab; keep the focused option in step.
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
      aria-label="Color mode"
      onKeyDown={onKeyDown}
      className={cn("mk-mode", compact && "mk-mode-compact")}
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

// "On this page": the top, then the page's sections. The current entry follows the scroll.
function OnThisPage({ sections }: { sections: PageSection[] }) {
  const [current, setCurrent] = useState("top");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((target): target is HTMLElement => target !== null);
    function onScroll() {
      // The last section whose top has passed a third of the way down the window.
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
      <nav className="mk-toc" aria-label="On this page">
        <p className="type-meta">On this page</p>
        <ul>
          {[{ id: "top", title: "Top" }, ...sections].map((link) => (
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

function NavLinks({ place }: { place?: Place }) {
  return (
    <ul className="mk-nav-list">
      {places.map(({ id, label, href }) => (
        <li key={id}>
          <a href={href} aria-current={id === place ? "page" : undefined}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// Pages are stock-first documents on light or dark ground. The lost page reads the stored mode without hydrating.
export function Shell({
  place,
  crumb,
  title,
  sections,
  interactive = true,
  opener,
  children,
}: {
  place?: Place;
  crumb: string;
  title: string;
  sections?: PageSection[];
  interactive?: boolean;
  opener: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <a href="#main" className="mk-skip">
        Skip to the page
      </a>
      <div className={cn("mk-head", place === "home" && "mk-head-home", !sections && "mk-head-solo")}>
        <header className="mk-mast">
          <a href="/" className="mk-brand">
            Maurice Kleine
          </a>
          <div className="mk-crumb">
            <span className="type-meta">{crumb}</span>
            <span className="type-meta" aria-hidden="true">
              /
            </span>
            <b>{title}</b>
          </div>
          <dl className="mk-meta">
            <dt className="type-meta">Status</dt>
            <dd>
              <span className="status-dot" aria-hidden="true"></span> Operational
            </dd>
            <dt className="type-meta">Sleep</dt>
            <dd>Degraded</dd>
            <dt className="type-meta">Ideas</dt>
            <dd>Backlogged</dd>
          </dl>
          {interactive && (
            <div className="mk-mast-mode">
              <ModeControl compact />
            </div>
          )}
        </header>
        <nav className="mk-nav mk-nav-compact" aria-label="Site">
          <NavLinks place={place} />
        </nav>
        {opener}
      </div>
      <div className={cn("mk-body", !sections && "mk-body-solo")}>
        <nav className="mk-nav" aria-label="Site">
          <NavLinks place={place} />
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
