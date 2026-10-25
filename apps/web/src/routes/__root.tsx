import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootDocument,
});

// The Worker serves the prerendered /404 at every path the site does not have. Hydrating it there, the client router
// would match that path instead of /404, and React would render the whole page again: TanStack's bare "Not Found" over
// blank sky canvases. The lost page is plain markup, so its document ships no client entry. lost-page.test.tsx holds it.
function RootDocument() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const essayPage = pathname === "/essays" || pathname.startsWith("/essays/");
  const lost = pathname === "/404";
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <canvas id="nebula" aria-hidden="true" />
        <canvas id="stars" aria-hidden="true" />
        <main className={lost ? "lost" : undefined}>
          <Outlet />
        </main>
        <script src="/texture.js" />
        <script src="/stars.js" />
        {!lost && <script src="/webmcp.js" />}
        {essayPage && <script src="/subscribe.js" />}
        <script async src="https://api.mauricekleine.com/latest.js" />
        {!lost && <Scripts />}
      </body>
    </html>
  );
}
