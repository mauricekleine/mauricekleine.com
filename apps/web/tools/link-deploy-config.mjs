import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const deployDir = resolve(root, '.wrangler/deploy')
await mkdir(deployDir, { recursive: true })
await writeFile(resolve(deployDir, 'config.json'), JSON.stringify({
  configPath: '../../apps/web/dist/server/wrangler.json',
  auxiliaryWorkers: [],
}))
