import assert from "node:assert/strict";
import test from "node:test";

const { handleSiteRequest } = await import("../src/server-behavior.ts");
const worker = { fetch: handleSiteRequest };
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

test("apex preserves the URL", async () => {
  const assets = { ASSETS: { fetch: () => { throw Error("unexpected asset lookup"); } } };
  const apex = await worker.fetch(new Request("https://mauricekleine.com/about?from=x"), assets);
  assert.equal(apex.status, 301);
  assert.equal(apex.headers.get("location"), origin + "/about?from=x");
});

// --- essay signup: /subscribe and /subscribe/confirm ---

function toBase64Url(bytes) {
  const bin = typeof bytes === "string" ? bytes : String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256(secret, message) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
}

async function makeTestToken(secret, email, expiryUnix) {
  const payload = `${email}.${expiryUnix}`;
  const sig = await hmacSha256(secret, payload);
  return `${toBase64Url(payload)}.${toBase64Url(sig)}`;
}

const subscribeSecrets = {
  RESEND_API_KEY: "resend-key",
  RESEND_SEGMENT_ID: "seg-123",
  TURNSTILE_SECRET: "turnstile-secret",
  SUBSCRIBE_SECRET: "subscribe-secret",
};

function stubFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ url, init });
    return handler(url, init);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test("POST /subscribe rejects an invalid email", async () => {
  const res = await worker.fetch(
    new Request(origin + "/subscribe", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", "cf-turnstile-response": "token" }),
    }),
    subscribeSecrets
  );
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.match(data.error, /valid email/);
});

test("POST /subscribe surfaces a failed turnstile check", async () => {
  const stub = stubFetch((url) => {
    assert.match(url, /^https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
    return new Response(JSON.stringify({ success: false }), { headers: { "content-type": "application/json" } });
  });
  try {
    const res = await worker.fetch(
      new Request(origin + "/subscribe", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ email: "person@example.com", "cf-turnstile-response": "bad-token" }),
      }),
      subscribeSecrets
    );
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.ok, false);
    assert.match(data.error, /human/);
    assert.equal(stub.calls.length, 1);
  } finally {
    stub.restore();
  }
});

test("POST /subscribe leaves an existing contact's subscription alone", async () => {
  const stub = stubFetch((url, init) => {
    if (url.startsWith("https://challenges.cloudflare.com/turnstile/v0/siteverify")) {
      return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json" } });
    }
    if (url === "https://api.resend.com/contacts/reader%40example.com") {
      return new Response(JSON.stringify({ id: "contact-2", unsubscribed: false }), { headers: { "content-type": "application/json" } });
    }
    if (url === "https://api.resend.com/emails") {
      return new Response(JSON.stringify({ id: "email-2" }), { headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected fetch: ${init?.method || "GET"} ${url}`);
  });
  try {
    const res = await worker.fetch(
      new Request(origin + "/subscribe", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ email: "reader@example.com", "cf-turnstile-response": "good-token" }),
      }),
      subscribeSecrets
    );
    assert.equal(res.status, 200);
    assert.ok(!stub.calls.some((c) => c.url === "https://api.resend.com/contacts"), "must not re-create an existing contact");
  } finally {
    stub.restore();
  }
});

test("POST /subscribe happy path verifies turnstile, upserts the contact and emails a confirmation link", async () => {
  const stub = stubFetch((url) => {
    if (url.startsWith("https://challenges.cloudflare.com/turnstile/v0/siteverify")) {
      return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json" } });
    }
    if (url === "https://api.resend.com/contacts/person%40example.com") {
      return new Response(JSON.stringify({ message: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }
    if (url === "https://api.resend.com/contacts") {
      return new Response(JSON.stringify({ id: "contact-1" }), { status: 201, headers: { "content-type": "application/json" } });
    }
    if (url === "https://api.resend.com/emails") {
      return new Response(JSON.stringify({ id: "email-1" }), { headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
  try {
    const res = await worker.fetch(
      new Request(origin + "/subscribe", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ email: "person@example.com", "cf-turnstile-response": "good-token" }),
      }),
      subscribeSecrets
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });

    assert.equal(stub.calls.length, 4);
    assert.match(stub.calls[0].url, /^https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);

    assert.equal(stub.calls[1].url, "https://api.resend.com/contacts/person%40example.com");
    assert.equal(stub.calls[2].url, "https://api.resend.com/contacts");
    assert.equal(stub.calls[2].init.method, "POST");
    assert.equal(stub.calls[2].init.headers.authorization, "Bearer resend-key");
    assert.deepEqual(JSON.parse(stub.calls[2].init.body), { email: "person@example.com", unsubscribed: true });

    assert.equal(stub.calls[3].url, "https://api.resend.com/emails");
    const emailBody = JSON.parse(stub.calls[3].init.body);
    assert.equal(emailBody.from, "maurice kleine <hey@mauricekleine.com>");
    assert.equal(emailBody.to, "person@example.com");
    assert.equal(emailBody.subject, "confirm: new essays from maurice");
    assert.match(emailBody.text, /click to confirm/);
    assert.match(emailBody.text, /\/subscribe\/confirm\?t=/);
    assert.match(emailBody.html, /\/subscribe\/confirm\?t=/);
  } finally {
    stub.restore();
  }
});

test("GET /subscribe/confirm accepts a valid token and confirms the contact", async () => {
  const token = await makeTestToken(subscribeSecrets.SUBSCRIBE_SECRET, "confirmed@example.com", Math.floor(Date.now() / 1000) + 60);
  const stub = stubFetch(() => new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } }));
  try {
    const res = await worker.fetch(new Request(`${origin}/subscribe/confirm?t=${encodeURIComponent(token)}`), subscribeSecrets);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.match(body, /you're in/);
    assert.match(body, /next essay lands in your inbox/);

    assert.equal(stub.calls.length, 2);
    assert.equal(stub.calls[0].url, "https://api.resend.com/contacts/confirmed%40example.com");
    assert.equal(stub.calls[0].init.method, "PATCH");
    assert.deepEqual(JSON.parse(stub.calls[0].init.body), { unsubscribed: false });
    assert.equal(stub.calls[1].url, "https://api.resend.com/contacts/confirmed%40example.com/segments/seg-123");
    assert.equal(stub.calls[1].init.method, "POST");
  } finally {
    stub.restore();
  }
});

test("GET /subscribe/confirm rejects a tampered token", async () => {
  const token = await makeTestToken(subscribeSecrets.SUBSCRIBE_SECRET, "tampered@example.com", Math.floor(Date.now() / 1000) + 60);
  const [payload, sig] = token.split(".");
  const tampered = `${payload}.${sig.slice(0, -1)}${sig.at(-1) === "a" ? "b" : "a"}`;
  const stub = stubFetch(() => { throw new Error("resend must not be called for a tampered token"); });
  try {
    const res = await worker.fetch(new Request(`${origin}/subscribe/confirm?t=${encodeURIComponent(tampered)}`), subscribeSecrets);
    assert.equal(res.status, 410);
    const body = await res.text();
    assert.match(body, /essays/);
    assert.equal(stub.calls.length, 0);
  } finally {
    stub.restore();
  }
});

test("GET /subscribe/confirm rejects an expired token", async () => {
  const token = await makeTestToken(subscribeSecrets.SUBSCRIBE_SECRET, "expired@example.com", Math.floor(Date.now() / 1000) - 60);
  const stub = stubFetch(() => { throw new Error("resend must not be called for an expired token"); });
  try {
    const res = await worker.fetch(new Request(`${origin}/subscribe/confirm?t=${encodeURIComponent(token)}`), subscribeSecrets);
    assert.equal(res.status, 410);
    const body = await res.text();
    assert.match(body, /expire/);
    assert.equal(stub.calls.length, 0);
  } finally {
    stub.restore();
  }
});

const noAssets = { ASSETS: { fetch: () => { throw Error("unexpected asset lookup"); } } };
const mk = "https://www.mauricekleine.com";
const dnb = "https://open.spotify.com/playlist/1m5LADqpLjiBERdtqrIiL0";
const shortLinks = {
  "": `${mk}/`, about: `${mk}/about`, essays: `${mk}/essays`,
  x: "https://x.com/mauricekleine",
  gh: "https://github.com/mauricekleine", github: "https://github.com/mauricekleine",
  in: "https://www.linkedin.com/in/mauricekleine/", linkedin: "https://www.linkedin.com/in/mauricekleine/",
  reddit: "https://www.reddit.com/user/mauricekleine/",
  ph: "https://www.producthunt.com/@mauricekleine", producthunt: "https://www.producthunt.com/@mauricekleine",
  luma: "https://luma.com/user/mauricekleine",
  tinkerers: "https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug",
  dnb,
  m: "https://www.getmockly.com/", mockly: "https://www.getmockly.com/",
  h: "https://hackadam.nl/", hacka: "https://hackadam.nl/", hackadam: "https://hackadam.nl/",
};
for (const name of ["f", "fluncle"]) Object.assign(shortLinks, {
  [name]: "https://www.fluncle.com/",
  [`${name}/gh`]: "https://github.com/mauricekleine/fluncle", [`${name}/github`]: "https://github.com/mauricekleine/fluncle",
  [`${name}/yt`]: "https://www.youtube.com/@fluncle", [`${name}/youtube`]: "https://www.youtube.com/@fluncle",
  [`${name}/tt`]: "https://www.tiktok.com/@fluncle", [`${name}/tiktok`]: "https://www.tiktok.com/@fluncle",
  [`${name}/dnb`]: dnb,
});
for (const name of ["n", "nonobench", "bench"]) Object.assign(shortLinks, {
  [name]: "https://www.nonobench.com/",
  [`${name}/gh`]: "https://github.com/mauricekleine/nonobench", [`${name}/github`]: "https://github.com/mauricekleine/nonobench",
});

test("mk.wtf redirects all 44 short links on both hosts", async () => {
  assert.equal(Object.keys(shortLinks).length, 44);
  for (const host of ["mk.wtf", "www.mk.wtf"]) {
    for (const [path, target] of Object.entries(shortLinks)) {
      const res = await worker.fetch(new Request(`https://${host}/${path}`), noAssets);
      assert.equal(res.status, 302, `${host}/${path}`);
      assert.equal(res.headers.get("location"), target, `${host}/${path}`);
      assert.equal(res.headers.get("cache-control"), "public, max-age=300");
    }
  }
  const { shortLinks: table } = await import("../src/links.ts");
  assert.deepEqual([...table.keys()].sort(), Object.keys(shortLinks).sort(), "no untested links");
});

test("mk.wtf ignores case and trailing slashes and keeps the query", async () => {
  for (const [path, target] of [
    ["/F/GH/", "https://github.com/mauricekleine/fluncle"],
    ["/Bench//", "https://www.nonobench.com/"],
    ["/x?ref=talk", "https://x.com/mauricekleine?ref=talk"],
    ["/f/dnb?a=1&a=2", `${dnb}?a=1&a=2`],
  ]) {
    const res = await worker.fetch(new Request(`https://mk.wtf${path}`), noAssets);
    assert.equal(res.headers.get("location"), target, path);
  }
});

test("an unknown mk.wtf link is a 404 that lists the real ones", async () => {
  for (const path of ["/nope", "/f/nope", "/m/gh", "/mcp", "/about/x"]) {
    const res = await worker.fetch(new Request(`https://mk.wtf${path}`), noAssets);
    assert.equal(res.status, 404, path);
    const body = await res.text();
    assert.match(body, /mk\.wtf\/f\/gh  https:\/\/github\.com\/mauricekleine\/fluncle/);
  }
});
