import type { ReactNode } from 'react'

type Tag = Record<string, string | boolean>

function decodeEntities(value: string): string {
  return value.replace(/&(?:#x([0-9a-f]+)|#([0-9]+)|(amp|quot|apos|lt|gt));/gi, (entity, hex: string | undefined, dec: string | undefined, named: string | undefined) => {
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16))
    if (dec) return String.fromCodePoint(Number.parseInt(dec, 10))
    return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' } as Record<string, string>)[named?.toLowerCase() ?? ''] ?? entity
  })
}

function attributes(tag: string): Tag {
  const result: Tag = {}
  const content = tag.replace(/^<\/?[\w-]+\s*|\/?\s*>$/g, '')
  const pattern = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  for (const match of content.matchAll(pattern)) {
    const value = match[2] ?? match[3] ?? match[4]
    result[match[1]] = value === undefined ? true : decodeEntities(value)
  }
  return result
}

export function legacyHead(html: string) {
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? ''
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => attributes(match[0]))
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => attributes(match[0]))
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((match) => ({
    ...attributes(`<script ${match[1]}>`),
    ...(match[2].trim() ? { children: match[2].trim() } : {}),
  }))
  return { meta: [{ title }, ...meta], links, scripts }
}

export function LegacyPage({ body }: { body: string }): ReactNode {
  const main = /<main(\s[^>]*)?>([\s\S]*?)<\/main>/.exec(body)
  if (!main) throw new Error('legacy page has no main element')
  const mainAttrs = attributes(`<main${main[1] ?? ''}>`)
  const scripts = [...body.matchAll(/<script\b[^>]*><\/script>/g)].map((match) => attributes(match[0].replace('</script>', '')))
  return (
    <>
      <canvas id="nebula" aria-hidden="true" />
      <canvas id="stars" aria-hidden="true" />
      <main className={typeof mainAttrs.class === 'string' ? mainAttrs.class : undefined} dangerouslySetInnerHTML={{ __html: main[2] }} />
      {scripts.map((attrs, index) => <script key={index} src={String(attrs.src)} async={attrs.async === true} defer={attrs.defer === true} />)}
    </>
  )
}
