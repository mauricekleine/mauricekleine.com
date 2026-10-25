import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { nav, navPinned, navSections, type NavEntry, type NavSection } from "./nav";
import { useEntry } from "./layout";
import { ThemeControl } from "./ThemeControl";

// The docs nav: one group per section, the current page boxed with the house square. Overview, foundations and
// components scroll on their own; the mock pages, install and the mode control hold the foot, under a 1 px rule
// that marks where the scrolling list is cut.
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

  const group = (section: NavSection) => (
    <NavGroup key={section} section={section} current={current} onNavigate={onNavigate} />
  );

  return (
    <nav aria-label="docs" className={cn("st-sidenav", className)}>
      <div ref={list} className="st-sidenav-list">
        {navSections.filter((section) => !navPinned.includes(section)).map(group)}
      </div>
      <div className="st-sidenav-foot">
        {navPinned.map(group)}
        <ThemeControl />
      </div>
    </nav>
  );
}

function NavGroup({
  section,
  current,
  onNavigate,
}: {
  section: NavSection;
  current: NavEntry;
  onNavigate?: () => void;
}) {
  const entries = nav.filter((entry) => entry.section === section);
  const titled = section !== "overview" && section !== "install";
  return (
    <div className={cn("st-sidenav-group", !titled && "st-sidenav-plain")}>
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
}
