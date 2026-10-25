import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { fontHeaders, handle } = await import("../src/server-behavior.ts");
const { fonts } = await import("@mauricekleine/superthread/fonts");
const { default: config } = await import("../cloudflare.config.ts");
const headersFile = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");

const site = "https://superthread.mauricekleine.com";
const ofl = fonts.filter((face) => face.acao === "*");
const itf = fonts.filter((face) => face.acao === "own origins");

const own = [
  "https://mauricekleine.com",
  "https://www.mauricekleine.com",
  "https://superthread.mauricekleine.com",
  "https://a-b.c.mauricekleine.com",
  "https://mk.wtf",
  "https://www.mk.wtf",
  "http://localhost",
  "http://localhost:3000",
  "http://127.0.0.1",
  "http://127.0.0.1:4173",
];
const foreign = [
  "null",
  "https://example.com",
  "http://mauricekleine.com",
  "http://www.mauricekleine.com",
  "https://mauricekleine.com.example.com",
  "https://evilmauricekleine.com",
  "https://mauricekleine.com:8443",
  "https://mk.wtf.example.com",
  "https://docs.mk.wtf",
  "http://mk.wtf",
  "https://localhost:3000",
  "http://localhost.example.com",
  "http://127.0.0.2:3000",
  "",
];

// a fake ASSETS binding that answers every request with the given status and headers, and records the paths
function assets(status = 200, headers = {}) {
  const seen = [];
  return {
    seen,
    env: {
      ASSETS: {
        fetch: async (request) => {
          seen.push(new URL(request.url).pathname);
          return new Response(status === 404 ? "not found" : "bytes", { status, headers });
        },
      },
    },
  };
}

const page = async () => new Response("<html></html>", { headers: { "content-type": "text/html" } });
const refuse = async () => {
  throw Error("a font or snapshot request must not reach the page handler");
};

async function fetchFace(file, origin, upstream = {}) {
  const headers = origin === undefined ? {} : { origin };
  const { env } = assets(200, upstream);
  return handle(new Request(`${site}/fonts/${file}`, { headers }), env, refuse);
}

test("the manifest has faces under both licences", () => {
  assert.ok(ofl.length > 0 && itf.length > 0);
  assert.equal(ofl.length + itf.length, fonts.length);
  for (const face of ofl) assert.equal(face.licence, "OFL", face.file);
  for (const face of itf) assert.equal(face.licence, "ITF FFL", face.file);
});

test("an OFL face goes to anyone, with or without an Origin", async () => {
  for (const face of ofl) {
    for (const origin of [undefined, ...own, ...foreign]) {
      const res = await fetchFace(face.file, origin);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("access-control-allow-origin"), "*", `${face.file} ${origin}`);
      assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
      assert.equal(res.headers.get("vary"), "Origin");
      assert.equal(await res.text(), "bytes");
    }
  }
});

test("an ITF face echoes Maurice's own origins and local development", async () => {
  for (const face of itf) {
    for (const origin of own) {
      const res = await fetchFace(face.file, origin);
      assert.equal(res.headers.get("access-control-allow-origin"), origin, `${face.file} ${origin}`);
      assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
      assert.equal(res.headers.get("vary"), "Origin");
    }
  }
});

test("an ITF face sends no CORS header to any other origin, null included", async () => {
  for (const face of itf) {
    for (const origin of [undefined, ...foreign]) {
      const res = await fetchFace(face.file, origin);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("access-control-allow-origin"), null, `${face.file} ${JSON.stringify(origin)}`);
      assert.equal(res.headers.get("vary"), "Origin");
      assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
    }
  }
});

test("the rule replaces whatever CORS header the asset layer sent", async () => {
  const wide = {
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=0",
    "content-type": "font/woff2",
  };
  const closed = await fetchFace(itf[0].file, "https://example.com", wide);
  assert.equal(closed.headers.get("access-control-allow-origin"), null);
  assert.equal(closed.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(closed.headers.get("content-type"), "font/woff2");
  const echoed = await fetchFace(itf[0].file, "http://localhost:3001", wide);
  assert.equal(echoed.headers.get("access-control-allow-origin"), "http://localhost:3001");
});

test("a missing face passes the asset layer's 404 through untouched", async () => {
  for (const file of [fonts[0].file, "nope.woff2"]) {
    const { env } = assets(404, { "cache-control": "no-store" });
    const res = await handle(new Request(`${site}/fonts/${file}`, { headers: { origin: own[0] } }), env, refuse);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("access-control-allow-origin"), null);
    assert.equal(res.headers.get("vary"), null);
    assert.equal(res.headers.get("cache-control"), "no-store");
  }
});

test("a file under /fonts/ that is not a face keeps the asset layer's headers", async () => {
  for (const path of ["/fonts/OFL.txt", "/fonts/LICENCE-ITF.txt", "/fonts/", "/fonts/sub/unbounded-300.woff2"]) {
    const { env, seen } = assets(200, { "cache-control": "public, max-age=300" });
    const res = await handle(new Request(site + path, { headers: { origin: "https://example.com" } }), env, refuse);
    assert.equal(res.status, 200, path);
    assert.deepEqual(seen, [path]);
    assert.equal(res.headers.get("access-control-allow-origin"), null, path);
    assert.equal(res.headers.get("cache-control"), "public, max-age=300", path);
    assert.equal(fontHeaders(path, "https://www.mauricekleine.com"), null, path);
  }
});

// a fake asset layer with one published snapshot file, as the real one answers: the file, a 304 for its own ETag,
// the prerendered 404 page for any other path, no body for HEAD, and the given headers over its defaults
const snapshot = "/r/v/2.0.0-next.1/button.json";
const notFoundPage = "<!doctype html><title>not found · superthread</title>";
function snapshots(upstream = {}) {
  const seen = [];
  return {
    seen,
    env: {
      ASSETS: {
        fetch: async (request) => {
          const path = new URL(request.url).pathname;
          seen.push(`${request.method} ${path}`);
          const hit = path === snapshot;
          const etag = hit ? '"button"' : '"404"';
          const status = !hit ? 404 : request.headers.get("if-none-match") === etag ? 304 : 200;
          const body = status === 304 || request.method === "HEAD" ? null : hit ? '{"name":"button"}' : notFoundPage;
          const headers = {
            "cache-control": "public, max-age=0, must-revalidate",
            "content-type": hit ? "application/json" : "text/html; charset=utf-8",
            etag,
            ...upstream,
          };
          return new Response(body, { status, headers });
        },
      },
    },
  };
}

test("a file in a published snapshot keeps for a year, for anyone, on GET, HEAD and a revalidation", async () => {
  for (const [method, conditional, status, body] of [
    ["GET", undefined, 200, '{"name":"button"}'],
    ["HEAD", undefined, 200, ""],
    ["GET", '"button"', 304, ""],
  ]) {
    const { env, seen } = snapshots();
    const headers = conditional === undefined ? {} : { "if-none-match": conditional };
    const res = await handle(new Request(site + snapshot, { method, headers }), env, refuse);
    assert.equal(res.status, status, `${method} ${conditional}`);
    assert.deepEqual(seen, [`${method} ${snapshot}`]);
    assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("etag"), '"button"');
    assert.equal(await res.text(), body);
  }
});

test("a missing snapshot file gets the 404 page, never stored, on GET and HEAD", async () => {
  // the asset layer sends what the old /r/v/* rule in public/_headers gave every response: a year, immutable
  const old = { "cache-control": "public, max-age=31536000, immutable" };
  const missing = ["/r/v/2.0.0-next.1/missing.json", "/r/v/2.0.0-next.2/button.json", "/r/v/2.0.0-next.1/"];
  for (const path of missing) {
    for (const method of ["GET", "HEAD"]) {
      const { env, seen } = snapshots(old);
      const res = await handle(new Request(site + path, { method }), env, refuse);
      assert.equal(res.status, 404, `${method} ${path}`);
      assert.deepEqual(seen, [`${method} ${path}`]);
      assert.equal(res.headers.get("cache-control"), "no-store", `${method} ${path}`);
      assert.equal(res.headers.get("access-control-allow-origin"), "*");
      assert.equal(res.headers.get("content-type"), "text/html; charset=utf-8");
      assert.equal(await res.text(), method === "GET" ? notFoundPage : "");
    }
  }
});

// the rules in public/_headers: each path pattern with the header names it sets
const headerRules = headersFile
  .split("\n")
  .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
  .reduce((rules, line) => {
    if (!/^\s/.test(line)) rules.push({ path: line.trim(), sets: [] });
    else if (line.includes(":")) rules.at(-1).sets.push(line.split(":")[0].trim().toLowerCase());
    return rules;
  }, []);
const literal = (text) => text.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
// _headers: * is a splat and :name a placeholder for one segment; runWorkerFirst: * is a deep glob and ! negates
const ruleMatches = (pattern, path) =>
  new RegExp(
    `^${literal(pattern)
      .replace(/\*/g, ".*")
      .replace(/:[A-Za-z]\w*/g, "[^/]+")}$`,
  ).test(path);
const runsFirst = (path) => {
  const patterns = config.worker.assets.runWorkerFirst;
  const glob = (pattern) => new RegExp(`^${literal(pattern).replace(/\*/g, ".*")}$`).test(path);
  const negated = patterns.filter((pattern) => pattern.startsWith("!")).map((pattern) => pattern.slice(1));
  return patterns.some((pattern) => !pattern.startsWith("!") && glob(pattern)) && !negated.some(glob);
};

test("the worker runs first for the paths it sets headers on, and public/_headers sets none of those headers", () => {
  const owned = [
    "/fonts/supreme-400.woff2",
    "/fonts/nope.woff2",
    snapshot,
    "/r/v/2.0.0-next.1/SHA256SUMS",
    "/r/v/2.0.0-next.1/missing.json",
    "/r/v/2.0.0-next.2/button.json",
  ];
  for (const path of owned) {
    assert.ok(runsFirst(path), `${path} must reach the worker first`);
    for (const rule of headerRules.filter((rule) => ruleMatches(rule.path, path)))
      for (const name of ["cache-control", "access-control-allow-origin"])
        assert.ok(!rule.sets.includes(name), `public/_headers ${rule.path} sets ${name} on ${path}`);
  }
  for (const path of ["/", "/components/button", "/r/registry.json", "/r/button.json", "/marks/orbit/orbit.svg"])
    assert.ok(!runsFirst(path), `${path} is the asset layer's, with its public/_headers rules`);
});

test("every other path goes to the page handler, never to the asset layer", async () => {
  for (const path of [
    "/",
    "/components/button",
    "/r/button.json",
    "/r/v",
    "/r/vx/button.json",
    "/marks/orbit/orbit.svg",
    "/fontsx/a.woff2",
  ]) {
    const { env, seen } = assets();
    const res = await handle(new Request(site + path), env, page);
    assert.equal(await res.text(), "<html></html>", path);
    assert.deepEqual(seen, [], path);
  }
});

test("fontHeaders names every face in the manifest and nothing else", () => {
  for (const face of fonts) assert.notEqual(fontHeaders(`/fonts/${face.file}`, null), null, face.file);
  assert.equal(fontHeaders("/fonts/unknown.woff2", null), null);
  assert.equal(fontHeaders("/unbounded-300.woff2", null), null);
});
