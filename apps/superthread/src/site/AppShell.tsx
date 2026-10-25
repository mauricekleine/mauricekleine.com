import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "@/components/superthread/ui/glyphs";
import { useEntry } from "./layout";
import { ThemeControl } from "./ThemeControl";

// The mock pages' layout: a 32 px strip back to the docs (the way back, the crumb and the mode control), then the
// app itself, full bleed on the deep ground, as it would ship.
export function AppShell({ children }: { children: ReactNode }) {
  const entry = useEntry();
  return (
    <div className="st-app">
      <a href="#main" className="st-skip">
        skip to the page
      </a>
      <header className="st-strip">
        <Link to="/" className="st-strip-back">
          <Icon name="left" />
          docs
        </Link>
        <p className="st-strip-crumb">
          <span className="type-meta">mock pages</span>
          <span className="type-meta" aria-hidden="true">
            /
          </span>
          <b>{entry.title}</b>
        </p>
        <ThemeControl compact className="st-strip-mode" />
      </header>
      <main id="main" className="st-app-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
