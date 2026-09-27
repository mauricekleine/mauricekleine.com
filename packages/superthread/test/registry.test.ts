import { expect, test } from 'bun:test'
import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { registrySchema } from 'shadcn/schema'

const root = join(import.meta.dir, '..')

test('registry catalog conforms to the shadcn schema and files exist', async () => {
  const registry = JSON.parse(await readFile(join(root, 'registry.json'), 'utf8'))
  expect(registrySchema.safeParse(registry).success).toBe(true)
  expect(registry.items.map((item: { name: string }) => item.name)).toEqual(['superthread', 'app-switcher'])
  for (const item of registry.items) for (const file of item.files) await access(join(root, '../..', file.path))
})
