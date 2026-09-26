import { expect, test } from 'bun:test'
import { readFile, readdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { registrySchema } from 'shadcn/schema'

const root = join(import.meta.dir, '..')

test('registry catalog conforms to the shadcn schema and files exist', async () => {
  const registry = JSON.parse(await readFile(join(root, 'registry.json'), 'utf8'))
  const result = registrySchema.safeParse(registry)
  expect(result.success).toBe(true)
  const names = new Set(registry.items.map((item: { name: string }) => item.name))
  expect(names.size).toBe(registry.items.length)
  for (const item of registry.items) {
    for (const file of item.files) await access(join(root, '../..', file.path))
    if (item.name !== 'superthread') expect(item.files.length).toBe(6)
  }
})

test('registry source contains no raw color literals', async () => {
  async function walk(path: string): Promise<string[]> {
    const entries = await readdir(path, { withFileTypes: true })
    const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : Promise.resolve([join(path, entry.name)])))
    return nested.flat()
  }
  for (const file of await walk(join(root, 'registry'))) {
    const source = await readFile(file, 'utf8')
    expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(?:oklch|rgb|rgba|hsl|hsla)\s*\(/)
  }
})
