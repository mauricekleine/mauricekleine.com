import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { nav, navSections } from "./nav";
import { useEntry } from "./layout";
import { ThemeControl } from "./ThemeControl";

// The docs nav: one group per section, the current page boxed with the house square, and the mode control at its
// foot. The list scrolls on its own, so the control stays in view.
export function SideNav({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const current = useEntry();
  const list = useRef<HTMLDivElement>(null);

  // bring the current page into the list's view without scrolling the page
  useLayoutEffect(() => {
    const box = list.current;
    const link = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !link) return;
    const top = link.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + link.offsetHeight > box.scrollTop + box.clientHeight)
      box.scrollTop = top - box.clientHeight / 2;
  }, [current.path]);

  return (
    <nav aria-label="docs" className={cn("st-sidenav", className)}>
      <div ref={list} className="st-sidenav-list">
        {navSections.map((section) => {
          const entries = nav.filter((entry) => entry.section === section);
          const titled = section !== "overview" && section !== "install";
          return (
            <div key={section} className={cn("st-sidenav-group", !titled && "st-sidenav-plain")}>
              {titled && <h3 className="type-meta">{section}</h3>}
              <ul>
                {entries.map((entry) => (
                  <li key={entry.path}>
                    <Link
                      to={entry.path}
                      activeOptions={{ exact: true }}
                      aria-current={entry.path === current.path ? "page" : undefined}
                      onClick={onNavigate}
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="st-sidenav-foot">
        <ThemeControl />
      </div>
    </nav>
  );
}
