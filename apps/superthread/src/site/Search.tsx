import { useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/superthread/ui/input-group";
import { nav, type NavEntry } from "./nav";

const limit = 8;

// Every word of the query must start a word of the page's title, section or item name; title matches rank first.
export function searchNav(query: string): NavEntry[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: [number, number, NavEntry][] = [];
  nav.forEach((entry, order) => {
    const title = entry.title.toLowerCase().split(/[\s-]+/);
    const rest = [entry.section, entry.item ?? ""]
      .join(" ")
      .toLowerCase()
      .split(/[\s-]+/);
    let score = 0;
    for (const word of words) {
      if (title.some((part) => part.startsWith(word))) score += 2;
      else if (rest.some((part) => part.startsWith(word))) score += 1;
      else return;
    }
    scored.push([score, order, entry]);
  });
  return scored
    .sort((a, b) => b[0] - a[0] || a[1] - b[1])
    .slice(0, limit)
    .map(([, , entry]) => entry);
}

// The masthead's search: an input-group from the registry, so it carries the field focus rule (one 2 px edge
// inside the box while the input holds focus). "/" focuses it from anywhere outside a text field, typing filters
// the nav, the arrow keys move through the matches and Enter opens one.
export function Search({ className }: { className?: string }) {
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchNav(query), [query]);
  const showList = open && query.trim() !== "";

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
      const field = input.current;
      if (!field || field.getClientRects().length === 0) return;
      event.preventDefault();
      field.focus();
      field.select();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(entry: NavEntry) {
    setQuery("");
    setOpen(false);
    input.current?.blur();
    // the page opens with focus at its start, as the skip link leaves it
    void navigate({ to: entry.path }).then(() => document.getElementById("main")?.focus({ preventScroll: true }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (results.length > 0) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((current) => (current + step + results.length) % results.length);
      }
    } else if (event.key === "Enter") {
      const entry = results[active];
      if (showList && entry) {
        event.preventDefault();
        go(entry);
      }
    } else if (event.key === "Escape") {
      if (showList) setOpen(false);
      else if (query !== "") setQuery("");
      else input.current?.blur();
    }
  }

  const activeId = showList && results[active] ? `${listId}-${active}` : undefined;

  return (
    <div className={cn("st-search", className)}>
      <InputGroup className="h-9">
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupInput
          ref={input}
          type="text"
          role="combobox"
          aria-label="search the docs"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          placeholder="search the docs"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <InputGroupAddon align="inline-end" className="pr-1.5 has-[>kbd]:mr-0">
          <kbd className="st-key" aria-hidden="true">
            /
          </kbd>
        </InputGroupAddon>
      </InputGroup>
      <ul
        id={listId}
        role="listbox"
        aria-label="pages"
        className="st-search-list border border-border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]"
        hidden={!showList}
      >
        {results.map((entry, index) => (
          <li
            key={entry.path}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(index)}
            onClick={() => go(entry)}
          >
            <span>{entry.title}</span>
            <span className="type-meta">{entry.section}</span>
          </li>
        ))}
        {results.length === 0 && (
          <li className="st-search-none" role="option" aria-selected={false} aria-disabled="true">
            no page matches
          </li>
        )}
      </ul>
    </div>
  );
}
