import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootDocument,
})

function RootDocument() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const essayPage = pathname === '/essays' || pathname.startsWith('/essays/')
  const lost = pathname === '/404'
  return <html lang="en">
    <head><HeadContent /></head>
    <body>
      <canvas id="nebula" aria-hidden="true" />
      <canvas id="stars" aria-hidden="true" />
      <main className={lost ? 'lost' : undefined}><Outlet /></main>
      <script src="/texture.js" />
      <script src="/stars.js" />
      {!lost && <script src="/webmcp.js" />}
      {essayPage && <script src="/subscribe.js" />}
      <script async src="https://api.mauricekleine.com/latest.js" />
      <Scripts />
    </body>
  </html>
}
