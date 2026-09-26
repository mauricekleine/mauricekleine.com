import { createFileRoute } from '@tanstack/react-router'
import { LegacyPage, legacyHead } from '../legacy-page'
import { staticPages } from '../static-pages'
import { essaysBody } from '../essay-lists'

export const Route = createFileRoute('/essays')({
  head: () => legacyHead(staticPages.essays.head),
  component: () => <LegacyPage body={essaysBody()} />,
})
