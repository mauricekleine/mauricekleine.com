import YAML from 'yaml'

export type EssayImage = {
  width: number
  height: number
  alt: string
}

export type Essay = {
  slug: string
  title: string
  seoTitle: string
  summary: string
  date: string
  dateDisplay: string
  cover: string
  coverOriginal: string
  coverSrcset: string
  coverSizes: string
  coverWidth: number
  coverHeight: number
  coverAlt: string
  x: string
  linkedin: string
  images: Record<string, EssayImage>
  inlineLinks?: Record<string, string>
  markdown: string
}

const sources = import.meta.glob('../content/essays/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function parseEssay(source: string): Essay {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source)
  if (!match) throw new Error('essay has no frontmatter')
  const metadata = YAML.parse(match[1]) as Omit<Essay, 'markdown'>
  return { ...metadata, markdown: source.slice(match[0].length) }
}

export const essays = Object.values(sources)
  .map(parseEssay)
  .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))

export const essaysBySlug: Record<string, Essay> = Object.fromEntries(essays.map((essay) => [essay.slug, essay]))

export function essayNeighbors(essay: Essay) {
  const index = essays.findIndex((entry) => entry.slug === essay.slug)
  return { newer: essays[index - 1], older: essays[index + 1] }
}

export function articleMarkdown(essay: Essay) {
  const firstBreak = essay.markdown.indexOf('\n\n')
  const secondBreak = essay.markdown.indexOf('\n\n', firstBreak + 2)
  if (firstBreak < 0 || secondBreak < 0) throw new Error(`missing essay introduction: ${essay.slug}`)
  let markdown = essay.markdown.slice(secondBreak + 2)
  for (const [label, href] of Object.entries(essay.inlineLinks ?? {})) {
    markdown = markdown.replaceAll(label, `[${label}](${href})`)
  }
  // The legacy twin puts a space before closing emphasis markers. Move the
  // space outside the marker so CommonMark renders the emphasis.
  markdown = markdown.replace(/_([^_\n]+) _/g, '_$1_ ')
  const blocks = markdown.split('\n\n')
  for (let index = 1; index < blocks.length; index++) {
    const priorListHasFootnote = blocks[index - 1].startsWith('- ') && /^- .*\*$/m.test(blocks[index - 1])
    if (priorListHasFootnote && blocks[index].startsWith('* ')) blocks[index] = `\\${blocks[index]}`
  }
  markdown = blocks.join('\n\n')
  return markdown
}
