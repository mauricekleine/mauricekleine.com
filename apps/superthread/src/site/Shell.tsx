import { useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Aside } from "./Aside";
import { useEntry } from "./layout";
import { Masthead } from "./Masthead";
import { Opener } from "./Opener";
import { SideNav } from "./SideNav";

// The docs layout: the masthead across the top, then the nav, the page and the aside in three columns divided by
// 1 px rules. At 1099 px and below the aside drops under the page; at 900 px and below the nav moves into the
// masthead's menu.
export function Shell({ children }: { children: ReactNode }) {
  const entry = useEntry();
  const lede = useMatches({ select: (matches) => matches.at(-1)?.staticData.openerLede });
  const kind = lede ? (entry.path === "/" ? "home" : "slim") : undefined;
  const page = <div className="st-page">{children}</div>;
  return (
    <>
      <a href="#main" className="st-skip">
        skip to the page
      </a>
      <Masthead island={kind !== undefined} />
      <div className="st-body" data-opener={kind}>
        <SideNav className="st-body-nav" />
        <main id="main" className="st-main" tabIndex={-1}>
          {kind && lede ? (
            <>
              <Opener kind={kind} title={kind === "home" ? "superthread" : entry.title} lede={lede} />
              <div className="st-column">{page}</div>
            </>
          ) : (
            page
          )}
        </main>
        <Aside />
      </div>
    </>
  );
}
