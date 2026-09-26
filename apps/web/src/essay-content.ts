import YAML from 'yaml'

type Essay = {
  slug: string
  title: string
  seoTitle: string
  summary: string
  date: string
  order: number
  dateDisplay: string
  cover: string
  coverSrcset: string
  coverSizes: string
  coverAlt: string
  coverWidth: number
  coverHeight: number
  headHtml: string
  beforeArticleHtml: string
  articleHtml: string
  afterArticleHtml: string
  markdown: string
}

const sources = import.meta.glob('../content/essays/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function parseEssay(source: string): Essay {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source)
  if (!match) throw new Error('essay has no frontmatter')
  const metadata = YAML.parse(match[1]) as Omit<Essay, 'markdown'>
  return { ...metadata, markdown: source.slice(match[0].length) }
}

export const essays = Object.values(sources).map(parseEssay).sort((a, b) => a.order - b.order)
export const essaysBySlug = Object.fromEntries(essays.map((essay) => [essay.slug, essay]))

export function essayBody(essay: Essay) {
  return `${essay.beforeArticleHtml}<article class="essay">\n${essay.articleHtml}\n      </article>${essay.afterArticleHtml}`
}
