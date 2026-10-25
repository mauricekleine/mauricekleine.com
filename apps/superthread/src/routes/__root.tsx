import { fonts } from "@mauricekleine/superthread/fonts";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/site/AppShell";
import { useEntry } from "@/site/layout";
import { entryFor, notFound } from "@/site/nav";
import { PageHead } from "@/site/PageHead";
import { Shell } from "@/site/Shell";
import appCss from "../styles/app.css?url";

const description =
  "superthread is maurice's design system: the tokens, the type, a mark for each ship and the branded shadcn components his apps install from one registry.";

export const Route = createRootRoute({
  head: ({ matches }) => {
    // a path the router does not know leaves only the root match, flagged not found
    const lost = matches.some((match) => match._notFound || match.status === "notFound");
    const entry = lost ? notFound : entryFor(matches.at(-1)?.pathname ?? "/");
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: entry.path === "/" ? "superthread" : `${entry.title} · superthread` },
        { name: "description", content: description },
        { name: "color-scheme", content: "light dark" },
      ],
      links: [
        // the faces the first view prints, from the one delivery the tokens item uses too
        ...fonts
          .filter((face) => face.preload)
          .map((face) => ({
            rel: "preload",
            href: `/fonts/${face.file}`,
            as: "font",
            type: "font/woff2",
            crossOrigin: "anonymous" as const,
          })),
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: "/marks/superthread/superthread.svg" },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/marks/superthread/superthread-dark.svg",
          media: "(prefers-color-scheme: dark)",
        },
      ],
    };
  },
  component: RootDocument,
  notFoundComponent: UnknownPath,
});

// The theme script is not rendered here: React would hoist the charset, the viewport and the stylesheet ahead of it,
// so the Worker (server.ts) puts it first in <head>. It sets the mode class on <html>; React renders none, so the
// two never disagree.
function RootDocument() {
  const entry = useEntry();
  const Layout = entry.layout === "app" ? AppShell : Shell;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Layout>
          <Outlet />
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

// /404 and any path the router does not know print the same page, so the prerendered /404 hydrates cleanly wherever
// the Worker serves it
export function NotFoundPage(): ReactNode {
  return (
    <PageHead
      title="not found"
      lede={
        <>
          no page lives at this address. the nav lists every page, or start at the <Link to="/">overview</Link>.
        </>
      }
    />
  );
}

// A path the router does not know renders here, straight from the root's <Outlet />; /404 is a child route, which that
// <Outlet /> wraps in a Suspense boundary. The Worker serves the prerendered /404 at every unknown path, so the page
// sits in the same boundary here. Without it the client's tree lacks a node the document has, and React renders the
// whole document again, which strips the mode the theme script set on <html>. not-found.test.tsx holds the two equal.
function UnknownPath(): ReactNode {
  return (
    <Suspense>
      <NotFoundPage />
    </Suspense>
  );
}
