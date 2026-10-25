// Serves a kept clean-room app (`run.ts --keep <name>`) for a look in a browser, and stops it again:
//
//   bun test/clean-room/serve.ts <name> [--port <port>]   start the app's dev server and print its url
//   bun test/clean-room/serve.ts <name> --stop            stop the server this script started for <name>
//
// The server listens on 127.0.0.1 in its own process group. Its pgid, port and log go to test/clean-room/.out/
// (`<name>.pgid`, `<name>.port`, `<name>-dev.log`, gitignored), never to the package root, and --stop signals that
// one group. Start it outside hyperspeed-run, which stops everything its command started when the command exits.
import { spawn } from "node:child_process";
import { existsSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { parseArgs } from "node:util";

const outDir = join(import.meta.dir, ".out");
const STARTUP_MS = 90_000;

function fail(message: string, code = 1): never {
  console.error(`serve: ${message}`);
  process.exit(code);
}

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2).filter((arg) => arg !== "--"),
  options: { port: { type: "string" }, stop: { type: "boolean", default: false } },
  allowPositionals: true,
  strict: true,
});
const name = positionals[0] ?? "";
if (positionals.length !== 1 || !/^[a-z0-9][a-z0-9.-]*$/.test(name))
  fail("usage: bun test/clean-room/serve.ts <name> [--port <port>] | <name> --stop", 2);
if (values.port !== undefined && !/^[1-9]\d{3,4}$/.test(values.port))
  fail(`--port takes a port number, not ${values.port}`, 2);

const app = join(outDir, name);
const files = {
  pgid: join(outDir, `${name}.pgid`),
  port: join(outDir, `${name}.port`),
  log: join(outDir, `${name}-dev.log`),
};

/** Whether any process in the group is still running. */
function alive(pgid: number): boolean {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return false;
    throw error;
  }
}

const recorded = () => (existsSync(files.pgid) ? Number(readFileSync(files.pgid, "utf8").trim()) : undefined);

async function stop(): Promise<void> {
  const pgid = recorded();
  if (!pgid) fail(`no .out/${name}.pgid, so nothing of mine to stop`);
  if (alive(pgid)) process.kill(-pgid, "SIGTERM");
  for (let waited = 0; alive(pgid) && waited < 5_000; waited += 100) await Bun.sleep(100);
  if (alive(pgid)) process.kill(-pgid, "SIGKILL");
  rmSync(files.pgid, { force: true });
  rmSync(files.port, { force: true });
  console.log(`serve: stopped ${name} (process group ${pgid})`);
}

/** A port nothing on 127.0.0.1 listens on right now. */
function freePort(): Promise<number> {
  return new Promise((done, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => (typeof address === "object" && address ? done(address.port) : reject(new Error("no port"))));
    });
  });
}

async function start(): Promise<void> {
  if (!existsSync(join(app, "package.json")))
    fail(`no kept app at .out/${name}; run \`bun run test:clean-room -- --keep ${name}\` first`);
  const running = recorded();
  if (running && alive(running)) fail(`${name} is already served (process group ${running}); stop it with --stop`);

  const port = values.port ? Number(values.port) : await freePort();
  const log = openSync(files.log, "w");
  const child = spawn("bun", ["run", "dev", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: app,
    detached: true,
    stdio: ["ignore", log, log],
  });
  if (!child.pid) fail("the dev server did not start");
  child.unref();
  writeFileSync(files.pgid, `${child.pid}\n`);
  writeFileSync(files.port, `${port}\n`);

  const url = `http://127.0.0.1:${port}/`;
  const deadline = Date.now() + STARTUP_MS;
  while (Date.now() < deadline) {
    if (!alive(child.pid)) {
      rmSync(files.pgid, { force: true });
      rmSync(files.port, { force: true });
      fail(`the dev server exited; see .out/${name}-dev.log`);
    }
    const answered = await fetch(url, { signal: AbortSignal.timeout(2_000) }).then(
      (res) => res.status,
      () => 0,
    );
    if (answered > 0) {
      console.log(`serve: ${name} at ${url} (process group ${child.pid}); stop it with --stop`);
      return;
    }
    await Bun.sleep(250);
  }
  await stop();
  fail(`the dev server did not answer within ${STARTUP_MS / 1000} s; see .out/${name}-dev.log`);
}

await (values.stop ? stop() : start());
