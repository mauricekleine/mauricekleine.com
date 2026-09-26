import { createFileRoute } from '@tanstack/react-router'
import { LegacyPage, legacyHead } from '../legacy-page'
import { staticPages } from '../static-pages'
import { homeBody } from '../essay-lists'

export const Route = createFileRoute('/')({
  head: () => legacyHead(staticPages.index.head),
  component: () => <LegacyPage body={homeBody()} />,
})
