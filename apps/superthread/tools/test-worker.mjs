import assert from "node:assert/strict";
import test from "node:test";

const { fontHeaders, handle } = await import("../src/server-behavior.ts");
const { fonts } = await import("@mauricekleine/superthread/fonts");

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
  throw Error("a font request must not reach the page handler");
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

test("every other path goes to the page handler, never to the asset layer", async () => {
  for (const path of ["/", "/components/button", "/r/button.json", "/marks/orbit/orbit.svg", "/fontsx/a.woff2"]) {
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
