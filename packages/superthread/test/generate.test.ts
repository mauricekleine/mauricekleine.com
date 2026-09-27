import { expect, test } from 'bun:test'
import { readTokens, themeCss } from '../scripts/generate'

const tokens = await readTokens()

test('paper and void supply every shadcn color role', () => {
  const roles = (mode: string) => Object.keys(tokens.colors).filter((name) => name.startsWith(`${mode}-`)).map((name) => name.slice(mode.length + 1)).sort()
  expect(roles('paper')).toEqual(roles('void'))
})

test('generated theme follows the shadcn selectors and mappings', async () => {
  const css = themeCss(tokens)
  expect(css).toContain(':root {')
  expect(css).toContain('.dark {')
  expect(css).toContain('@theme inline {')
  expect(css).toContain('@layer base {')
  expect(css).toContain('--font-sans: "Supreme", sans-serif;')
  expect(css).toContain('--font-serif: "Erode", serif;')
  expect(css).toContain('--font-mono: "Fragment Mono", monospace;')
  expect(css).toContain('--font-display: "Panchang", sans-serif;')
  expect(await Bun.file(new URL('../dist/superthread.css', import.meta.url)).text()).toBe(css)
})
