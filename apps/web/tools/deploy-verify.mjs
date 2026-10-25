import { spawnSync } from "node:child_process";

function git(...args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  return { ok: result.status === 0, output: result.stdout.trim(), error: result.stderr.trim() };
}

const SHARE_PATHS = ["apps/share", "packages/superthread", "package.json", "bun.lock"];
const SUPERTHREAD_PATHS = ["apps/superthread", "packages/superthread", "package.json", "bun.lock"];

async function waitFor(worker, deadline, timeout) {
  let observed;
  while (true) {
    try {
      const response = await fetch(`${worker.url}?verify=${Date.now()}`, {
        headers: { "cache-control": "no-cache" },
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) {
        const sha = (await response.json()).sha;
        observed = `live SHA ${sha ?? "missing"}`;
        if (/^[0-9a-f]{40}$/.test(sha)) {
          if (!git("cat-file", "-e", `${sha}^{commit}`).ok) git("fetch", "--quiet", "origin", "main");
          if (git("merge-base", "--is-ancestor", worker.target, sha).ok) {
            process.stdout.write(`${worker.name} Worker ${sha} contains ${worker.target}.\n`);
            return;
          }
        }
      } else observed = `live signal returned HTTP ${response.status}`;
    } catch (error) {
      observed = `live signal unavailable: ${error instanceof Error ? error.message : String(error)}`;
    }
    if (Date.now() >= deadline) throw new Error(`${worker.name} Worker timed out after ${timeout}s; ${observed}`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(15_000, deadline - Date.now())));
  }
}

try {
  const target = process.argv[2];
  if (process.argv.length !== 3 || !/^[0-9a-f]{40}$/.test(target ?? "")) {
    throw new Error("expected one full 40-character commit SHA");
  }
  const timeout = Number(process.env.DEPLOY_VERIFY_TIMEOUT ?? 1200);
  if (!Number.isSafeInteger(timeout) || timeout < 1) {
    throw new Error("DEPLOY_VERIFY_TIMEOUT must be a positive number of seconds");
  }
  const fetched = git("fetch", "--quiet", "origin", "main");
  if (!fetched.ok) throw new Error(`could not fetch origin/main: ${fetched.error}`);
  if (
    !git("cat-file", "-e", `${target}^{commit}`).ok ||
    !git("merge-base", "--is-ancestor", target, "origin/main").ok
  ) {
    throw new Error(`${target} is not a commit on origin/main`);
  }

  // Workers Builds deploys artifact-share and the superthread site only for their paths,
  // so each must contain the newest commit at or before the target that touched them.
  const workers = [{ name: "Web", url: "https://www.mauricekleine.com/api/deploy.json", target }];
  for (const [name, url, paths] of [
    ["Share", "https://share.mauricekleine.com/_health", SHARE_PATHS],
    ["Superthread", "https://superthread.mauricekleine.com/api/deploy.json", SUPERTHREAD_PATHS],
  ]) {
    const change = git("log", "-1", "--format=%H", target, "--", ...paths);
    if (!change.ok) throw new Error(`could not read ${name.toLowerCase()} history: ${change.error}`);
    if (change.output) workers.push({ name, url, target: change.output });
  }

  const deadline = Date.now() + timeout * 1000;
  for (const worker of workers) await waitFor(worker, deadline, timeout);
} catch (error) {
  process.stderr.write(
    `deploy:verify: ${String(error instanceof Error ? error.message : error).replace(/\s+/g, " ")}\n`,
  );
  process.exitCode = 1;
}
