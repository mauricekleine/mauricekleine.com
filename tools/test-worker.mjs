import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const origin = "https://www.mauricekleine.com";
const env = (response) => ({ ASSETS: { fetch: async () => response() } });

test("verified HTML aliases become permanent and retain queries and headers", async () => {
  for (const method of ["GET", "HEAD"]) {
    for (const [path, target] of [
      ["/about.html", "/about"], ["/about/", "/about"],
      ["/essays.html", "/essays"], ["/essays/ride-the-floor-up/", "/essays/ride-the-floor-up"],
      ["/essays/ride-the-floor-up.html", "/essays/ride-the-floor-up"],
      ["/index.html", "/"], ["/index", "/"],
    ]) {
      const query = "?from=search&tag=a%2Fb";
      const res = await worker.fetch(new Request(origin + path + query, { method }), env(() => new Response(null, {
        status: 307, headers: { location: target + query, "strict-transport-security": "max-age=31536000" },
      })));
      assert.equal(res.status, 308, `${method} ${path}`);
      assert.equal(res.headers.get("location"), target + query);
      assert.equal(res.headers.get("strict-transport-security"), "max-age=31536000");
    }
  }
});

test("unrelated redirects, methods, assets and missing pages retain their response", async () => {
  for (const [path, method, status, location] of [
    ["/missing.html", "GET", 404, null], ["/fonts/", "GET", 404, null],
    ["/about.html", "POST", 307, "/about"], ["/about.html", "GET", 302, "/about"],
    ["/about.html", "GET", 307, "https://elsewhere.example/about"],
    ["/about.html?keep=1", "GET", 307, "/about?changed=1"],
    ["/old-campaign", "GET", 307, "/about"], ["/maurice.png", "GET", 200, null],
  ]) {
    const res = await worker.fetch(new Request(origin + path, { method }), env(() => new Response("body", {
      status, headers: location ? { location } : {},
    })));
    assert.equal(res.status, status, `${method} ${path}`);
    assert.equal(res.headers.get("location"), location);
    assert.equal(await res.text(), "body");
  }
});

test("Markdown preference, canonical headers and missing twins still work", async () => {
  const requests = [];
  const assets = { ASSETS: { fetch: async (request) => {
    const path = new URL(request.url || request).pathname;
    requests.push(path);
    return path.startsWith("/essays/missing")
      ? new Response("not found", { status: 404 })
      : new Response(path.endsWith(".md") ? "# about" : "<h1>about</h1>");
  } } };
  for (const [accept, body] of [["text/markdown, text/html;q=0.5", "# about"], ["text/html, text/markdown;q=0.5", "<h1>about</h1>"], ["*/*", "<h1>about</h1>"]]) {
    const res = await worker.fetch(new Request(origin + "/about", { headers: { accept } }), assets);
    assert.equal(await res.text(), body);
    assert.equal(res.headers.get("vary"), "accept");
    if (body.startsWith("#")) assert.equal(res.headers.get("link"), `<${origin}/about>; rel="canonical"`);
  }
  const mirror = await worker.fetch(new Request(origin + "/about.md"), assets);
  assert.equal(mirror.headers.get("link"), `<${origin}/about>; rel="canonical"`);
  const missing = await worker.fetch(new Request(origin + "/essays/missing", { headers: { accept: "text/markdown" } }), assets);
  assert.equal(missing.status, 404);
  assert.deepEqual(requests.slice(-2), ["/essays/missing.md", "/essays/missing"]);
});

test("a missing essay asset cannot inherit immutable caching", async () => {
  const res = await worker.fetch(new Request(origin + "/essays/missing/01.webp"), env(() => new Response("not found", {
    status: 404, headers: { "cache-control": "public, max-age=31536000, immutable" },
  })));
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("cache-control"), "public, max-age=0, must-revalidate");
});

test("apex preserves the URL and MCP still responds without asset lookup", async () => {
  const assets = { ASSETS: { fetch: () => { throw Error("unexpected asset lookup"); } } };
  const apex = await worker.fetch(new Request("https://mauricekleine.com/about?from=x"), assets);
  assert.equal(apex.status, 301);
  assert.equal(apex.headers.get("location"), origin + "/about?from=x");
  const rpc = await worker.fetch(new Request(origin + "/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }) }), assets);
  assert.deepEqual(await rpc.json(), { jsonrpc: "2.0", id: 1, result: {} });
});
