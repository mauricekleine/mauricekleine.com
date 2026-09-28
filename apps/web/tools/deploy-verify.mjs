import { spawnSync } from 'node:child_process'

function git(...args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  return { ok: result.status === 0, output: result.stdout.trim(), error: result.stderr.trim() }
}

try {
  const target = process.argv[2]
  if (process.argv.length !== 3 || !/^[0-9a-f]{40}$/.test(target ?? '')) {
    throw new Error('expected one full 40-character commit SHA')
  }
  const timeout = Number(process.env.DEPLOY_VERIFY_TIMEOUT ?? 1200)
  if (!Number.isSafeInteger(timeout) || timeout < 1) {
    throw new Error('DEPLOY_VERIFY_TIMEOUT must be a positive number of seconds')
  }
  const fetched = git('fetch', '--quiet', 'origin', 'main')
  if (!fetched.ok) throw new Error(`could not fetch origin/main: ${fetched.error}`)
  if (!git('cat-file', '-e', `${target}^{commit}`).ok || !git('merge-base', '--is-ancestor', target, 'origin/main').ok) {
    throw new Error(`${target} is not a commit on origin/main`)
  }

  const deadline = Date.now() + timeout * 1000
  let observed = 'no live SHA signal'
  while (true) {
    try {
      const response = await fetch(`https://www.mauricekleine.com/api/deploy.json?verify=${Date.now()}`, {
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(10_000),
      })
      if (response.ok) {
        const sha = (await response.json()).sha
        observed = `live SHA ${sha ?? 'missing'}`
        if (/^[0-9a-f]{40}$/.test(sha)) {
          if (!git('cat-file', '-e', `${sha}^{commit}`).ok) git('fetch', '--quiet', 'origin', 'main')
          if (git('merge-base', '--is-ancestor', target, sha).ok) {
            process.stdout.write(`Live Worker ${sha} contains ${target}.\n`)
            break
          }
        }
      } else observed = `live signal returned HTTP ${response.status}`
    } catch (error) {
      observed = `live signal unavailable: ${error instanceof Error ? error.message : String(error)}`
    }
    if (Date.now() >= deadline) throw new Error(`timed out after ${timeout}s; ${observed}`)
    await new Promise((resolve) => setTimeout(resolve, Math.min(15_000, deadline - Date.now())))
  }
} catch (error) {
  process.stderr.write(`deploy:verify: ${String(error instanceof Error ? error.message : error).replace(/\s+/g, ' ')}\n`)
  process.exitCode = 1
}
