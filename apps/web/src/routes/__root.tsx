import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from "@tanstack/react-router";
import { themeScript } from "@/components/superthread/lib/theme";
import tokens from "../../../../packages/superthread/dist/v2/tokens.json";

export const Route = createRootRoute({
  component: RootDocument,
});

// The Worker serves the prerendered /404 at every path the site does not have. Hydrating it there, the client router
// would match that path instead of /404, and React would render the whole page again: TanStack's bare "Not Found" in
// the shell. The lost page is plain markup, so its document ships no client entry. lost-page.test.tsx holds it.
function RootDocument() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const essayPage = pathname === "/essays" || pathname.startsWith("/essays/");
  const lost = pathname === "/404";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          content={tokens.light.background.hex}
          data-light={tokens.light.background.hex}
          data-dark={tokens.dark.background.hex}
          suppressHydrationWarning
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <script src="/sky.js" />
        {!lost && <script src="/webmcp.js" />}
        {essayPage && <script src="/subscribe.js" />}
        <script async src="https://api.mauricekleine.com/latest.js" />
        {!lost && <Scripts />}
      </body>
    </html>
  );
}
