import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const sha = process.env.WORKERS_CI_COMMIT_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('build commit is not a full SHA')

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../public/api')
await mkdir(directory, { recursive: true })
await writeFile(resolve(directory, 'deploy.json'), `${JSON.stringify({ sha })}\n`)
