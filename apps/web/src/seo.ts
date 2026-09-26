import type { JSX } from 'react'
import type { Essay } from './essay-content'

const origin = 'https://www.mauricekleine.com'
const personId = `${origin}/#maurice`
const socialImage = `${origin}/og.png`
const socialImageAlt = 'maurice kleine, amsterdam. i build small internet things and sometimes they work. a night sky with project constellations.'
const sameAs = [
  'https://github.com/mauricekleine',
  'https://www.linkedin.com/in/mauricekleine/',
  'https://x.com/mauricekleine',
  'https://www.reddit.com/user/mauricekleine/',
  'https://peerlist.io/mockly',
  'https://www.producthunt.com/@mauricekleine',
  'https://luma.com/user/mauricekleine',
  'https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug',
]
const knows = [
  { '@type': 'Person', name: 'Jasper de Boer', sameAs: 'https://x.com/jasperdeboer' },
  { '@type': 'Person', name: 'Abner van den Hout', sameAs: 'https://x.com/AbnerHout' },
]
const author = { '@type': 'Person', '@id': personId, name: 'Maurice Kleine', url: `${origin}/` }

type Meta = JSX.IntrinsicElements['meta']
type Link = JSX.IntrinsicElements['link']
type Script = JSX.IntrinsicElements['script']
type StructuredData = Record<string, unknown>

type PageSeo = {
  path?: string
  title: string
  description: string
  robots?: string
  markdown?: string
  feed?: boolean
  authorLink?: boolean
  apiCatalog?: boolean
  ogType?: 'website' | 'profile' | 'article'
  ogTitle?: string
  ogDescription?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
  imageAlt?: string
  twitterImageAlt?: boolean
  published?: string
  turnstile?: boolean
  relativeStylesheet?: boolean
  jsonLd?: StructuredData
}

export function canonical(path: string): string {
  return `${origin}${path}`
}

function buildHead(page: PageSeo): { meta: Meta[]; links: Link[]; scripts: Script[] } {
  const meta: Meta[] = [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { title: page.title },
    { name: 'description', content: page.description },
    { name: 'robots', content: page.robots ?? 'index,follow' },
    { name: 'theme-color', content: '#11131f' },
  ]
  const links: Link[] = []

  if (page.path !== undefined) links.push({ rel: 'canonical', href: canonical(page.path) })
  if (page.feed) links.push({ rel: 'alternate', type: 'application/atom+xml', href: '/feed.xml', title: 'essays feed' })
  if (page.markdown) links.push({ rel: 'alternate', type: 'text/markdown', href: page.markdown, title: 'markdown version' })
  if (page.apiCatalog) links.push({ rel: 'api-catalog', href: '/.well-known/api-catalog' })
  if (page.authorLink) links.push({ rel: 'author', href: '/humans.txt' })

  if (page.published) {
    meta.push(
      { property: 'article:published_time', content: page.published },
      { property: 'article:author', content: canonical('/about') },
    )
  }

  if (page.ogType && page.path !== undefined) {
    const title = page.ogTitle ?? page.title
    const description = page.ogDescription ?? page.description
    const image = page.image ?? socialImage
    meta.push(
      { property: 'og:type', content: page.ogType },
      { property: 'og:site_name', content: 'Maurice Kleine' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: String(page.imageWidth ?? 1200) },
      { property: 'og:image:height', content: String(page.imageHeight ?? 630) },
      { property: 'og:image:alt', content: page.imageAlt ?? socialImageAlt },
      { property: 'og:url', content: canonical(page.path) },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    )
    if (page.twitterImageAlt) meta.push({ name: 'twitter:image:alt', content: page.imageAlt ?? socialImageAlt })
  }

  links.push(
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'apple-touch-icon', href: '/maurice.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/panchang-800.woff2', crossOrigin: '' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/supreme-400.woff2', crossOrigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap' },
    { rel: 'stylesheet', href: `${page.relativeStylesheet ? '' : '/'}style.css?v=20260925-subscribe` },
  )

  const scripts: Script[] = []
  if (page.turnstile) scripts.push({ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true })
  if (page.jsonLd) scripts.push({ type: 'application/ld+json', children: JSON.stringify(page.jsonLd) })
  return { meta, links, scripts }
}

const homePerson = {
  ...author,
  image: canonical('/maurice.png'),
  description: 'ai engineer and indie hacker. i build small internet things and sometimes they work',
  email: 'mailto:hey@mauricekleine.com',
  jobTitle: 'AI Engineering Lead',
  worksFor: { '@type': 'Organization', name: 'Waimakers', url: 'https://waimakers.com' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Groningen' },
  homeLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
  },
  knowsAbout: ['artificial intelligence', 'llm applications', 'web development', 'indie hacking', 'ai automation'],
  sameAs,
  knows,
}

export function homeHead() {
  return buildHead({
    path: '/',
    title: 'maurice kleine - ai engineer in amsterdam',
    description: 'ai engineer and indie hacker in amsterdam. day job at waimakers, building mockly, fluncle, hackadam and nonobench after dinner.',
    markdown: '/index.md',
    feed: true,
    authorLink: true,
    apiCatalog: true,
    ogType: 'website',
    ogDescription: 'i build small internet things and sometimes they work',
    twitterImageAlt: true,
    relativeStylesheet: true,
    jsonLd: { '@context': 'https://schema.org', ...homePerson },
  })
}

export function aboutHead() {
  return buildHead({
    path: '/about',
    title: 'about maurice kleine - ai engineer and indie hacker',
    description: 'about maurice kleine: 14+ years of building software from amsterdam. a logistics exit, co-founding subthread, now ai engineering lead at waimakers.',
    markdown: '/about.md',
    ogType: 'profile',
    ogDescription: 'about maurice kleine - i build stuff on the internet from amsterdam',
    twitterImageAlt: true,
    relativeStylesheet: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: canonical('/about'),
      mainEntity: { ...author, image: canonical('/maurice.png'), jobTitle: 'AI Engineering Lead', sameAs, knows },
    },
  })
}

export function essaysHead(essays: readonly Pick<Essay, 'slug' | 'title'>[]) {
  return buildHead({
    path: '/essays',
    title: 'essays on ai and building software - maurice kleine',
    description: 'essays by maurice kleine, first posted on x and linkedin. on ai coding agents, hyperspeed, and building small internet things.',
    markdown: '/essays.md',
    feed: true,
    authorLink: true,
    ogType: 'website',
    imageAlt: 'maurice kleine, amsterdam. a night sky with project constellations.',
    turnstile: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'essays',
      url: canonical('/essays'),
      author,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: essays.map((essay, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: canonical(`/essays/${essay.slug}`),
          name: essay.title,
        })),
      },
    },
  })
}

export function notFoundHead() {
  return buildHead({
    title: '404 - Maurice Kleine',
    description: 'this page drifted out of orbit',
    robots: 'noindex',
  })
}

export function essayHead(essay: Essay) {
  const path = `/essays/${essay.slug}`
  const image = canonical(essay.coverOriginal)
  const headline = essay.markdown.split('\n').find((line) => line.startsWith('# '))?.slice(2).trim()
  if (!headline) throw new Error(`essay ${essay.slug} has no Markdown title`)
  const sources = [essay.x, essay.linkedin].filter((url): url is string => Boolean(url))
  return buildHead({
    path,
    title: essay.seoTitle,
    description: essay.summary,
    markdown: `${path}.md`,
    authorLink: true,
    ogType: 'article',
    ogTitle: essay.title,
    image,
    imageWidth: essay.coverWidth,
    imageHeight: essay.coverHeight,
    imageAlt: `cover image for ${essay.title}`,
    twitterImageAlt: true,
    published: essay.date,
    turnstile: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline,
      description: essay.summary,
      datePublished: essay.date,
      dateModified: essay.date,
      url: canonical(path),
      mainEntityOfPage: canonical(path),
      image,
      author,
      sameAs: sources.length === 1 ? sources[0] : sources,
    },
  })
}
