import { useEffect, useState } from "react";
import { useEntry, useSections } from "./layout";
import { States } from "./States";
import { Wedge } from "./Wedge";

// The right column: "on this page" (the page head, then the page's sections), the wedge and the states. At 1099 px
// and below it drops under the page. The current entry follows the scroll.
export function Aside() {
  const entry = useEntry();
  const sections = useSections();
  const links = [{ id: "top", title: entry.title }, ...sections];
  const [current, setCurrent] = useState("top");

  useEffect(() => {
    setCurrent("top");
    if (sections.length === 0) return;
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
    <aside className="st-aside">
      <div className="st-aside-inner">
        <nav className="st-toc" aria-label="on this page">
          <p className="type-meta">on this page</p>
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} aria-current={link.id === current ? "location" : undefined}>
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Wedge />
        <States />
      </div>
    </aside>
  );
}
