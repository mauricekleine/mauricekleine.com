import { expect, test } from 'bun:test'
import { readTokens, themeCss } from '../scripts/generate'

const tokens = await readTokens()

test('paper and void supply the same color roles', () => {
  const roles = (mode: string) => Object.keys(tokens.colors).filter((name) => name.startsWith(`${mode}-`)).map((name) => name.slice(mode.length + 1)).sort()
  expect(roles('paper')).toEqual(roles('void'))
})

test('dist/superthread.css is regenerated from DESIGN.md', async () => {
  expect(await Bun.file(new URL('../dist/superthread.css', import.meta.url)).text()).toBe(themeCss(tokens))
})
