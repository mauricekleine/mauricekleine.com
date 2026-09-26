import { createFileRoute, notFound } from '@tanstack/react-router'
import { essayBody, essaysBySlug } from '../essay-content'
import { LegacyPage, legacyHead } from '../legacy-page'

export const Route = createFileRoute('/essays_/$slug')({
  loader: ({ params }) => {
    const essay = essaysBySlug[params.slug]
    if (!essay) throw notFound()
    return essay
  },
  head: ({ loaderData }) => legacyHead(loaderData!.headHtml),
  component: EssayPage,
})

function EssayPage() {
  const essay = Route.useLoaderData()
  return <LegacyPage body={essayBody(essay)} />
}
