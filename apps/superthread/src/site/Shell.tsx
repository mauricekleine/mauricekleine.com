import type { ReactNode } from "react";
import { Aside } from "./Aside";
import { Masthead } from "./Masthead";
import { SideNav } from "./SideNav";

// The docs layout: the masthead across the top, then the nav, the page and the aside in three columns divided by
// 1 px rules. At 1099 px and below the aside drops under the page; at 900 px and below the nav moves into the
// masthead's menu.
export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="st-skip">
        skip to the page
      </a>
      <Masthead />
      <div className="st-body">
        <SideNav className="st-body-nav" />
        <main id="main" className="st-main" tabIndex={-1}>
          <div className="st-page">{children}</div>
        </main>
        <Aside />
      </div>
    </>
  );
}
