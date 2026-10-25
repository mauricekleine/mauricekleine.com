import { useLocation, useMatches } from "@tanstack/react-router";
import { entryFor, type NavEntry } from "./nav";

// A page's sections, for the aside's "on this page". Each route declares them as static data, so the prerendered
// markup already holds the list: `staticData: { sections: [{ id: "install", title: "install" }] }`.
export type PageSection = { id: string; title: string };

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    sections?: readonly PageSection[];
  }
}

// the master's breakpoints, as max-width queries: the masthead tightens, the aside drops below the page, the nav
// becomes the top bar, and the phone plates take over
export const breakpoints = { wide: 1279, aside: 1099, bar: 900, phone: 600 } as const;

// the nav entry for the current page; /404 and any unknown path get the not-found entry
export function useEntry(): NavEntry {
  return entryFor(useLocation({ select: (location) => location.pathname }));
}

// the current page's sections, from the deepest match that declares them
export function useSections(): readonly PageSection[] {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const sections = matches[i].staticData.sections;
    if (sections) return sections;
  }
  return [];
}
