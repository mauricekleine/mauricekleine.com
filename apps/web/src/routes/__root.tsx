import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootDocument,
})

function RootDocument() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const essayPage = pathname === '/essays' || pathname.startsWith('/essays/')
  const lost = pathname === '/404'
  const specimen = pathname === '/superthread'
  return <html lang="en" className={specimen ? undefined : 'dark'}>
    <head><HeadContent /></head>
    <body>
      {!specimen && <canvas id="nebula" aria-hidden="true" />}
      {!specimen && <canvas id="stars" aria-hidden="true" />}
      <main className={lost ? 'lost' : undefined}><Outlet /></main>
      {!specimen && <script src="/texture.js" />}
      {!specimen && <script src="/stars.js" />}
      {!lost && !specimen && <script src="/webmcp.js" />}
      {essayPage && <script src="/subscribe.js" />}
      <script async src="https://api.mauricekleine.com/latest.js" />
      <Scripts />
    </body>
  </html>
}
