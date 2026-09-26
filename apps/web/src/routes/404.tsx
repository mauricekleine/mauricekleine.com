import { createFileRoute } from '@tanstack/react-router'
import { LegacyPage, legacyHead } from '../legacy-page'
import { staticPages } from '../static-pages'

export const Route = createFileRoute('/404')({
  head: () => legacyHead(staticPages['404'].head),
  component: () => <LegacyPage body={staticPages['404'].body} />,
})
