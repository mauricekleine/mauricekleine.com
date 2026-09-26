import { createFileRoute, notFound } from '@tanstack/react-router'
import { essayNeighbors, essaysBySlug } from '../essay-content'
import { EssayArticle } from '../essay-markdown'
import { EssayNav, Footer, Hero, Subscribe } from '../components'
import { essayHead } from '../seo'

export const Route = createFileRoute('/essays_/$slug')({
  loader: ({ params }) => {
    const essay = essaysBySlug[params.slug]
    if (!essay) throw notFound()
    return essay
  },
  head: ({ loaderData }) => essayHead(loaderData!),
  component: EssayPage,
})

function EssayPage() {
  const essay = Route.useLoaderData()
  const { older, newer } = essayNeighbors(essay)
  return <>
    <Hero className="hero page-hero">
      <p className="hero-meta"><a href="/essays">← essays</a></p>
      <h1 className="essay-title">{essay.title}</h1>
      <p className="essay-meta">
        by <a href="/about">maurice kleine</a> · <time dateTime={essay.date}>{essay.dateDisplay}</time> ·
        first posted on <a href={essay.x}>x</a>{essay.linkedin && <> and <a href={essay.linkedin}>linkedin</a></>}
      </p>
    </Hero>
    <EssayArticle essay={essay} />
    <Subscribe />
    <Footer>
      <EssayNav older={older} newer={newer} />
      <p><a href="/essays">← all essays</a></p>
    </Footer>
  </>
}
