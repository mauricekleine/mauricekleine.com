import { expect, test } from 'bun:test'
import { readTokens, themeCss } from '../scripts/generate'

const tokens = await readTokens()

test('every paper color role has a void value', () => {
  for (const name of Object.keys(tokens.colors).filter((name) => name.startsWith('paper-'))) {
    expect(tokens.colors[`void-${name.slice(6)}`]).toBeDefined()
  }
})

test('dist/superthread.css is regenerated from DESIGN.md', async () => {
  expect(await Bun.file(new URL('../dist/superthread.css', import.meta.url)).text()).toBe(themeCss(tokens))
})
