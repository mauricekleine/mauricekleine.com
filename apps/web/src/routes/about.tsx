import { createFileRoute } from '@tanstack/react-router'
import { LegacyPage, legacyHead } from '../legacy-page'
import { staticPages } from '../static-pages'

export const Route = createFileRoute('/about')({
  head: () => legacyHead(staticPages.about.head),
  component: () => <LegacyPage body={staticPages.about.body} />,
})
