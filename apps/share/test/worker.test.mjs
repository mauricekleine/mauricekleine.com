import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createHash } from "node:crypto";
import { request as httpRequest } from "node:http";
import { fileURLToPath } from "node:url";
import { localWorker } from "../tools/local.mjs";
const worker = localWorker({
  modules: [
    { type: "ESModule", path: fileURLToPath(new URL("./clock-worker.mjs", import.meta.url)) },
    { type: "ESModule", path: fileURLToPath(new URL("../dist/worker.js", import.meta.url)) },
  ],
});
after(() => worker.dispose());
const origin = "https://share.mauricekleine.com";
const id = "Public1234567890",
  pinId = "Protected1234567";
const salt = "0123456789abcdef0123456789abcdef";
const pinHash = createHash("sha256").update(`${salt}:482913`).digest("hex");
const auth = { Authorization: "Bearer local-test-admin-only" };
const fingerprint = "a".repeat(64);
const admin = (path, method = "GET", body) =>
  worker.dispatchFetch(`${origin}/_admin/shares${path}`, { method, headers: auth, body });
const get = (path, headers = {}) => worker.dispatchFetch(origin + path, { headers });
async function stage(identity, mode, body = "<title>snapshot</title>", extras = []) {
  const files = [
    { path: "index.html", size: Buffer.byteLength(body) },
    ...extras.map(([path, data]) => ({ path, size: Buffer.byteLength(data) })),
  ];
  const start = await admin(
    `/${identity}/uploads`,
    "POST",
    JSON.stringify({ mode, fingerprint, ...(mode === "pin" ? { salt, pinHash } : {}), files }),
  );
  assert.equal(start.status, 201, await start.clone().text());
  const { upload } = await start.json();
  for (const [path, data] of [["index.html", body], ...extras])
    assert.equal((await admin(`/${identity}/uploads/${upload}/files/${path}`, "PUT", data)).status, 204);
  return upload;
}
async function commit(identity, upload) {
  const response = await admin(`/${identity}/uploads/${upload}/commit`, "POST");
  assert.equal(response.status, 200, await response.clone().text());
  return response.json();
}
async function challenge(identity) {
  const response = await get(`/${identity}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
  const html = await response.text();
  assert.match(html, /shared with you/);
  return html.match(/name="challenge" value="([^"]+)"/)[1];
}
function unlock(identity, challenge, pin) {
  return worker.dispatchFetch(`${origin}/${identity}/_unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: "null" },
    body: new URLSearchParams({ challenge, pin }).toString(),
    redirect: "manual",
  });
}
function headers(response, sandbox = true) {
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  if (sandbox) assert.match(response.headers.get("Content-Security-Policy"), /^sandbox allow-scripts/);
  else assert.equal(response.headers.get("Content-Security-Policy"), null);
}
test("real R2/SQLite HTTP contract: uploads, atomic replace, auth, PINs and lockout", async () => {
  for (const path of ["/", "/unknown12345/", "/_admin/shares", "/%5fadmin/shares"]) {
    const response = await get(path);
    assert.equal(response.status, path.includes("admin") ? 401 : 404);
    headers(response);
  }
  assert.deepEqual(await (await get("/_health")).json(), { sha: "local-test" });
  for (const method of ["POST", "DELETE", "PUT", "OPTIONS"]) {
    const response = await worker.dispatchFetch(`${origin}/_admin/shares/${id}`, { method });
    assert.equal(response.status, 401);
    headers(response);
  }
  const upload = await stage(id, "public", "old", [
    ["index.pdf", "%PDF-1.7"],
    ["assets/image.svg", "<svg/>"],
    ["unknown.constructor", "download"],
  ]);
  assert.equal((await get(`/${id}/`)).status, 404);
  await commit(id, upload);
  let response = await get(`/${id}/`);
  assert.equal(await response.text(), "old");
  headers(response);
  response = await get(`/${id}/index.pdf`);
  headers(response, false);
  response = await get(`/${id}/assets/image.svg`);
  assert.equal(response.headers.get("Content-Type"), "image/svg+xml");
  response = await get(`/${id}/unknown.constructor`);
  assert.equal(response.headers.get("Content-Type"), "application/octet-stream");
  assert.equal(response.headers.get("Content-Disposition"), "attachment");
  const newer = await stage(id, "public", "new");
  assert.equal(await (await get(`/${id}/`)).text(), "old");
  await commit(id, newer);
  assert.equal(await (await get(`/${id}/`)).text(), "new");
  assert.equal((await get(`/${id}/index.pdf`)).status, 404);
  assert.equal((await admin(`/${id}/uploads/${newer}/files/index.html`, "PUT", "bad")).status, 409);
  assert.equal((await admin(`/${id}/uploads/${newer}/commit`, "POST")).status, 200);
  for (const path of ["../escape", ".secret", "a/../b", "a\\b", "%2e%2e/secret", "_unlock", "index.html?x", "a//b"]) {
    response = await admin(
      `/${id}/uploads`,
      "POST",
      JSON.stringify({
        mode: "public",
        fingerprint,
        files: [
          { path: "index.html", size: 0 },
          { path, size: 1 },
        ],
      }),
    );
    assert.equal(response.status, 400, path);
  }
  response = await admin(
    `/${id}/uploads`,
    "POST",
    JSON.stringify({ mode: "public", fingerprint, files: [{ path: "index.html", size: 3 }] }),
  );
  const incomplete = (await response.json()).upload;
  assert.equal((await admin(`/${id}/uploads/${incomplete}/commit`, "POST")).status, 409);
  assert.equal((await admin(`/${id}/uploads/${incomplete}/files/index.html`, "PUT", "oversized")).status, 413);
  assert.equal((await admin(`/${id}/uploads/${incomplete}/files/index.html`, "PUT", "x")).status, 400);
  assert.equal(await (await get(`/${id}/`)).text(), "new");
  await commit(pinId, await stage(pinId, "pin", "protected content"));
  const form = await challenge(pinId);
  assert.equal((await unlock(pinId, "forged", "482913")).status, 403);
  response = await unlock(pinId, form, "482913");
  assert.equal(response.status, 303);
  headers(response);
  const cookie = response.headers.get("Set-Cookie");
  for (const flag of ["HttpOnly", "Secure", "SameSite=Lax", `Path=/${pinId}/`, "Max-Age=2592000"])
    assert.ok(cookie.includes(flag));
  const cookieHeader = cookie.split(";")[0];
  response = await get(`/${pinId}/`, { Cookie: cookieHeader });
  assert.equal(await response.text(), "protected content");
  headers(response);
  assert.match(await (await get(`/${pinId}/`, { Cookie: cookieHeader.slice(0, -1) + "z" })).text(), /shared with you/);
  const darkPin = await get(`/${pinId}/`, { Cookie: "mk-other=1; mk-theme=dark" });
  assert.match(
    darkPin.headers.get("Content-Security-Policy"),
    /font-src https:\/\/superthread\.mauricekleine\.com\/fonts\//,
  );
  assert.match(await darkPin.text(), /<html lang="en" class="dark">/);
  assert.match(await (await get(`/${pinId}/`, { Cookie: "mk-theme=auto" })).text(), /<html lang="en">/);
  const other = "Another123456789";
  await commit(other, await stage(other, "pin", "other protected"));
  assert.match(
    await (await get(`/${other}/`, { Cookie: cookieHeader.replaceAll(pinId, other) })).text(),
    /shared with you/,
  );
  assert.equal((await unlock(other, form, "482913")).status, 403);
  const wrong = await Promise.all(Array.from({ length: 5 }, () => unlock(pinId, form, "000000")));
  assert.deepEqual(wrong.map((r) => r.status).sort(), [403, 403, 403, 403, 429]);
  response = await unlock(pinId, form, "482913");
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get("Retry-After")) >= 3590);
  headers(response);
  assert.equal(await (await get(`/${pinId}/`, { Cookie: cookieHeader })).text(), "protected content");
  await commit(pinId, await stage(pinId, "pin", "rotated"));
  assert.match(await (await get(`/${pinId}/`, { Cookie: cookieHeader })).text(), /shared with you/);
  assert.equal((await unlock(pinId, await challenge(pinId), "482913")).status, 429);
  await get("/_test/advance-clock?ms=3600001");
  const expiredForm = await challenge(pinId);
  assert.equal(
    (await unlock(pinId, expiredForm, "000000")).status,
    403,
    "one wrong PIN after an expired lock starts a fresh failure window",
  );
  assert.equal((await unlock(pinId, expiredForm, "482913")).status, 303);
  const listed = (await (await admin("")).json()).shares;
  assert.equal(listed.length, 3);
  assert.ok(listed.every((s) => !s.salt && !s.pinHash));
  assert.equal((await admin(`/${pinId}`, "DELETE")).status, 204);
  assert.equal((await get(`/${pinId}/`, { Cookie: cookieHeader })).status, 404);
  assert.equal((await admin(`/${pinId}`, "DELETE")).status, 204);
  assert.equal((await get(`/${id}/%2e%2e/%2e%2e/_admin/shares`)).status, 401);
});
test("committed files serve single byte ranges and HEAD with the same security headers", async () => {
  const identity = "Ranges1234567890";
  const body = "0123456789";
  const types = [
    ["index.html", "text/html; charset=utf-8", true],
    ["index.mp4", "video/mp4", false],
    ["clip.WEBM", "video/webm", false],
    ["audio.m4a", "audio/mp4", false],
    ["audio.mp3", "audio/mpeg", false],
    ["index.pdf", "application/pdf", false],
    ["image.svg", "image/svg+xml", true],
    ["unknown.bin", "application/octet-stream", true],
  ];
  await commit(
    identity,
    await stage(identity, "public", body, [...types.slice(1).map(([path]) => [path, body]), ["empty.txt", ""]]),
  );
  for (const [path, type, sandbox] of types) {
    for (const [range, status, contentRange, expected] of [
      [undefined, 200, null, body],
      ["bytes=0-1", 206, "bytes 0-1/10", "01"],
      ["bytes=3-", 206, "bytes 3-9/10", "3456789"],
      ["bytes=-3", 206, "bytes 7-9/10", "789"],
      ["bytes=9-99", 206, "bytes 9-9/10", "9"],
      ["bytes=-99999999999999999999999", 206, "bytes 0-9/10", body],
      ["bytes=0-99999999999999999999999", 206, "bytes 0-9/10", body],
      ["bytes=10-", 416, "bytes */10", ""],
      ["bytes=99999999999999999999999-", 416, "bytes */10", ""],
      ["bytes=4-2", 416, "bytes */10", ""],
      ["bytes=-0", 416, "bytes */10", ""],
      ["bytes=0-1,4-5", 200, null, body],
      ["bytes=99-100,0-1", 200, null, body],
      ["bytes=invalid", 200, null, body],
      ["items=0-1", 200, null, body],
    ]) {
      let getHeaders;
      for (const method of ["GET", "HEAD"]) {
        const response = await worker.dispatchFetch(`${origin}/${identity}/${path}`, {
          method,
          headers: { "Accept-Encoding": "identity", ...(range ? { Range: range } : {}) },
        });
        assert.equal(response.status, status, `${method} ${path} ${range}`);
        assert.equal(response.headers.get("Accept-Ranges"), "bytes");
        assert.equal(response.headers.get("Content-Range"), contentRange);
        assert.equal(response.headers.get("Content-Length"), String(expected.length), `${method} ${path} ${range}`);
        assert.equal(response.headers.get("Content-Type"), type);
        assert.equal(
          response.headers.get("Content-Disposition"),
          type === "application/octet-stream" ? "attachment" : null,
        );
        headers(response, sandbox);
        assert.equal(await response.text(), method === "HEAD" ? "" : expected);
        if (method === "GET") getHeaders = [...response.headers];
        else assert.deepEqual([...response.headers], getHeaders);
      }
    }
  }
  for (const method of ["GET", "HEAD"]) {
    for (const range of [undefined, "bytes=0-", "bytes=-1"]) {
      const response = await worker.dispatchFetch(`${origin}/${identity}/empty.txt`, {
        method,
        headers: { "Accept-Encoding": "identity", ...(range ? { Range: range } : {}) },
      });
      assert.equal(response.status, range ? 416 : 200);
      assert.equal(response.headers.get("Content-Length"), "0");
      assert.equal(response.headers.get("Content-Range"), range ? "bytes */0" : null);
      assert.equal(response.headers.get("Accept-Ranges"), "bytes");
      assert.equal(await response.text(), "");
      headers(response);
    }
  }
  assert.equal((await get(`/${identity}/missing.mp4`, { Range: "bytes=0-1" })).status, 404);
});
test("PIN media ranges require the version-bound cookie, including after unlocking", async () => {
  const identity = "PinRanges1234567";
  const share = () => stage(identity, "pin", "player", [["index.mp4", "0123456789"]]);
  await commit(identity, await share());
  async function locked(cookie) {
    for (const method of ["GET", "HEAD"]) {
      const response = await worker.dispatchFetch(`${origin}/${identity}/index.mp4`, {
        method,
        headers: { Range: "bytes=0-1", ...(cookie ? { Cookie: cookie } : {}) },
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      assert.equal(response.headers.get("Content-Range"), null);
      assert.equal(response.headers.get("Accept-Ranges"), null);
      headers(response);
      if (method === "GET") assert.match(await response.text(), /shared with you/);
      else assert.equal(await response.text(), "");
    }
  }
  await locked();
  const response = await unlock(identity, await challenge(identity), "482913");
  const cookie = response.headers.get("Set-Cookie").split(";")[0];
  for (const method of ["GET", "HEAD"]) {
    const media = await worker.dispatchFetch(`${origin}/${identity}/index.mp4`, {
      method,
      headers: { Cookie: cookie, Range: "bytes=0-1" },
    });
    assert.equal(media.status, 206);
    assert.equal(media.headers.get("Content-Type"), "video/mp4");
    assert.equal(media.headers.get("Content-Range"), "bytes 0-1/10");
    assert.equal(media.headers.get("Content-Length"), "2");
    assert.equal(media.headers.get("Accept-Ranges"), "bytes");
    assert.equal(await media.text(), method === "HEAD" ? "" : "01");
    headers(media, false);
  }
  await locked();
  await commit(identity, await share());
  await locked(cookie);
  await admin(`/${identity}`, "DELETE");
  assert.equal((await get(`/${identity}/index.mp4`, { Cookie: cookie, Range: "bytes=0-1" })).status, 404);
});
test("media, ordinary file and snapshot limits are enforced at their exact byte boundaries", async () => {
  const identity = "Limits1234567890";
  const MiB = 1024 * 1024;
  const start = (files) =>
    admin(`/${identity}/uploads`, "POST", JSON.stringify({ mode: "public", fingerprint, files }));
  for (const [path, limit] of [
    ["index.mp4", 95 * MiB],
    ["clip.WEBM", 95 * MiB],
    ["audio.m4a", 95 * MiB],
    ["audio.mp3", 95 * MiB],
    ["asset.bin", 10 * MiB],
    ["fake.mp4.txt", 10 * MiB],
  ]) {
    for (const extra of [0, 1]) {
      const response = await start([
        { path: "index.html", size: 0 },
        { path, size: limit + extra },
      ]);
      assert.equal(response.status, extra ? 400 : 201, `${path}: ${limit + extra}`);
    }
  }
  for (const extra of [0, 1]) {
    const response = await start([
      { path: "index.html", size: 0 },
      { path: "index.mp4", size: 95 * MiB },
      { path: "poster.jpg", size: 5 * MiB + extra },
    ]);
    assert.equal(response.status, extra ? 400 : 201, `snapshot: ${100 * MiB + extra}`);
  }
  for (const count of [200, 201]) {
    const response = await start([
      { path: "index.html", size: 0 },
      ...Array.from({ length: count - 1 }, (_, i) => ({ path: `file-${i}.txt`, size: 0 })),
    ]);
    assert.equal(response.status, count === 200 ? 201 : 400);
  }
  const files = [
    { path: "index.html", size: 0 },
    { path: "index.mp4", size: 95 * MiB },
    { path: "poster.jpg", size: 5 * MiB },
  ];
  const { upload } = await (await start(files)).json();
  // A chunked sender exercises the read bound without allocating the whole file.
  const stream = (size, byte = 42) =>
    new ReadableStream({
      pull(controller) {
        if (!size) return controller.close();
        const length = Math.min(size, 64 * 1024);
        controller.enqueue(new Uint8Array(length).fill(byte));
        size -= length;
      },
    });
  const put = (path, size, byte) =>
    worker.dispatchFetch(`${origin}/_admin/shares/${identity}/uploads/${upload}/files/${path}`, {
      method: "PUT",
      headers: auth,
      body: stream(size, byte),
      duplex: "half",
    });
  const bucket = await worker.getR2Bucket("BUCKET");
  for (const file of files) {
    if (file.path === "index.mp4") {
      for (const [size, status] of [
        [file.size + 1, 413],
        [file.size - 1, 400],
      ]) {
        assert.equal((await put(file.path, size)).status, status, `media upload: ${size}`);
        assert.equal(
          await bucket.head(`${identity}/${upload}/${file.path}`),
          null,
          "failed uploads leave no partial object",
        );
        assert.equal((await admin(`/${identity}/uploads/${upload}/commit`, "POST")).status, 409);
      }
    }
    assert.equal((await put(file.path, file.size)).status, 204, file.path);
  }
  await commit(identity, upload);
  const tail = await get(`/${identity}/index.mp4`, { Range: `bytes=${95 * MiB - 2}-` });
  assert.equal(tail.status, 206);
  assert.deepEqual(new Uint8Array(await tail.arrayBuffer()), new Uint8Array([42, 42]));
  // Non-media's 10 MiB boundary is also exercised by real uploads, with retry after failure.
  const { upload: ordinary } = await (await start([{ path: "index.html", size: 10 * MiB }])).json();
  for (const [size, status] of [
    [10 * MiB + 1, 413],
    [10 * MiB - 1, 400],
    [10 * MiB, 204],
  ]) {
    const response = await worker.dispatchFetch(
      `${origin}/_admin/shares/${identity}/uploads/${ordinary}/files/index.html`,
      {
        method: "PUT",
        headers: auth,
        body: stream(size),
        duplex: "half",
      },
    );
    assert.equal(response.status, status, `ordinary upload: ${size}`);
    if (status !== 204) assert.equal((await admin(`/${identity}/uploads/${ordinary}/commit`, "POST")).status, 409);
  }
  await commit(identity, ordinary);
});
async function within(promise, ms, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => (timer = setTimeout(() => reject(new Error(message)), ms))),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
test("a slow file PUT leaves other links responsive and excludes a second writer until commit", async () => {
  const identity = "SlowUpload123456",
    open = "DuringUpload1234";
  await commit(open, await stage(open, "public", "still served"));
  const { upload } = await (
    await admin(
      `/${identity}/uploads`,
      "POST",
      JSON.stringify({
        mode: "public",
        fingerprint,
        files: [
          { path: "index.html", size: 10 },
          { path: "note.txt", size: 4 },
        ],
      }),
    )
  ).json();
  const path = `/${identity}/uploads/${upload}`;
  let sender;
  const pending = worker.dispatchFetch(`${origin}/_admin/shares${path}/files/index.html`, {
    method: "PUT",
    headers: auth,
    duplex: "half",
    body: new ReadableStream({
      start(controller) {
        sender = controller;
        controller.enqueue(new TextEncoder().encode("0"));
      },
    }),
  });
  try {
    // Leave the sender open, as in the reviewer's slow-upload probe.
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = await within(get(`/${open}/`), 1000, "another link waited on the file upload");
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "still served");
    assert.equal(
      (
        await within(
          admin(`${path}/files/index.html`, "PUT", "abcdefghij"),
          1000,
          "a concurrent PUT waited on the first writer",
        )
      ).status,
      409,
    );
    assert.equal((await admin(`${path}/files/note.txt`, "PUT", "done")).status, 204);
    assert.equal((await admin(`${path}/commit`, "POST")).status, 409);
  } finally {
    sender.enqueue(new TextEncoder().encode("123456789"));
    sender.close();
    assert.equal((await pending).status, 204);
  }
  await commit(identity, upload);
  assert.equal(await (await get(`/${identity}/`)).text(), "0123456789");
  assert.equal(await (await get(`/${identity}/note.txt`)).text(), "done");
});
test("a received-path retry drains its large HTTP body before 204 without blocking another link or rewriting R2", async () => {
  const identity = "RetryUpload12345";
  const open = "DuringRetry1234";
  await commit(open, await stage(open, "public", "still served"));
  const upload = await stage(identity, "public", "original");
  const path = `/${identity}/uploads/${upload}/files/index.html`;
  const bucket = await worker.getR2Bucket("BUCKET");
  const key = `${identity}/${upload}/index.html`;
  const before = await bucket.head(key);
  // A different body with the same length must not rewrite the first object.
  assert.equal((await admin(path, "PUT", "replaced")).status, 204);
  const address = await worker.ready;
  let responded = false;
  const request = httpRequest(new URL(`/_admin/shares${path}`, address), {
    method: "PUT",
    headers: auth,
  });
  const pending = new Promise((resolve, reject) => {
    request.on("error", reject);
    request.on("response", (response) => {
      responded = true;
      response.resume();
      resolve(response.statusCode);
    });
  });
  // Observe errors immediately, including a reset while the client is still sending.
  pending.catch(() => {});
  try {
    await within(
      (async () => {
        const chunk = Buffer.alloc(64 * 1024, "x");
        for (let sent = 0; sent < 16 * 1024 * 1024; sent += chunk.length) {
          await new Promise((resolve, reject) => request.write(chunk, (error) => (error ? reject(error) : resolve())));
        }
      })(),
      10000,
      "retry body could not be sent in full",
    );
    // Keep the chunked request open after all bytes, so EOF determines success.
    const response = await within(get(`/${open}/`), 1000, "another link waited on the retry body");
    assert.equal(await response.text(), "still served");
    assert.equal(responded, false, "204 must wait for the retry body to finish");
    request.end();
    assert.equal(await within(pending, 1000, "received-path retry never completed"), 204);
  } finally {
    request.destroy();
    await pending.catch(() => {});
  }
  assert.equal((await bucket.head(key)).etag, before.etag);
  assert.equal(await (await bucket.get(key)).text(), "original");
  await commit(identity, upload);
  assert.equal(await (await get(`/${identity}/`)).text(), "original");
});
test("new and received file PUTs time out after 30 idle seconds and remain retryable", async () => {
  const identity = "IdleUpload123456";
  const { upload } = await (
    await admin(
      `/${identity}/uploads`,
      "POST",
      JSON.stringify({
        mode: "public",
        fingerprint,
        files: [{ path: "index.html", size: 10 }],
      }),
    )
  ).json();
  const path = `/${identity}/uploads/${upload}`;
  const retryId = "IdleRetry1234567";
  const retry = await stage(retryId, "public", "original");
  const retryPath = `/${retryId}/uploads/${retry}`;
  await Promise.all(
    [path, retryPath].map(async (base) => {
      let sender;
      const pending = worker.dispatchFetch(`${origin}/_admin/shares${base}/files/index.html`, {
        method: "PUT",
        headers: auth,
        duplex: "half",
        body: new ReadableStream({
          start(controller) {
            sender = controller;
            controller.enqueue(new TextEncoder().encode("0"));
          },
        }),
      });
      const started = Date.now();
      try {
        const response = await within(pending, 35000, "stalled upload did not time out");
        assert.equal(response.status, 408, base);
        assert.match((await response.json()).error, /idle/i);
        assert.ok(Date.now() - started >= 29000, "timeout must allow 30 seconds without a chunk");
      } finally {
        sender.close();
        await pending;
      }
    }),
  );
  const bucket = await worker.getR2Bucket("BUCKET");
  assert.equal(await bucket.head(`${identity}/${upload}/index.html`), null);
  assert.equal((await admin(`${path}/commit`, "POST")).status, 409);
  assert.equal((await admin(`${path}/files/index.html`, "PUT", "0123456789")).status, 204);
  await commit(identity, upload);
  assert.equal(await (await get(`/${identity}/`)).text(), "0123456789");
  assert.equal((await admin(`${retryPath}/files/index.html`, "PUT", "replaced")).status, 204);
  await commit(retryId, retry);
  assert.equal(await (await get(`/${retryId}/`)).text(), "original");
});
test("a stalled PIN unlock body does not hold the store for other links", async () => {
  const stalled = "Stalled123456789",
    open = "OpenLink12345678";
  await commit(stalled, await stage(stalled, "pin", "stalled protected"));
  await commit(open, await stage(open, "public", "still served"));
  let sender;
  const body = new ReadableStream({
    start(controller) {
      sender = controller;
      controller.enqueue(new TextEncoder().encode("challenge="));
    },
  });
  const pending = worker
    .dispatchFetch(`${origin}/${stalled}/_unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      duplex: "half",
      redirect: "manual",
    })
    .catch(() => null);
  await new Promise((resolve) => setTimeout(resolve, 200));
  let timer;
  const response = await Promise.race([
    get(`/${open}/`),
    new Promise((resolve) => (timer = setTimeout(() => resolve(null), 5000))),
  ]);
  clearTimeout(timer);
  sender.error(new Error("test done"));
  await pending;
  assert.ok(response, "a concurrent request to another link waited on the stalled unlock body");
  assert.equal(await response.text(), "still served");
  const oversized = await worker.dispatchFetch(`${origin}/${stalled}/_unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "pin=" + "1".repeat(2048),
  });
  assert.equal(oversized.status, 413);
  headers(oversized);
});
test("shares expire 30 days after commit, re-sharing renews, and the alarm reclaims them", async () => {
  const DAY = 86400000;
  const pub = "Expiring12345678",
    pin = "ExpiringPin12345",
    renewed = "Renewed123456789";
  const lifetime = (receipt) => Date.parse(receipt.expiresAt) - Date.parse(receipt.updated);
  const first = await commit(pub, await stage(pub, "public", "expiring"));
  assert.ok(lifetime(first) >= 30 * DAY && lifetime(first) < 30 * DAY + 60000, first.expiresAt);
  assert.equal((await admin(`/${pub}/uploads/${first.version}/commit`, "POST")).status, 200);
  assert.equal(
    (await (await admin(`/${pub}/uploads/${first.version}/commit`, "POST")).json()).expiresAt,
    first.expiresAt,
  );
  await commit(pin, await stage(pin, "pin", "expiring protected"));
  const cookie = (await unlock(pin, await challenge(pin), "482913")).headers.get("Set-Cookie").split(";")[0];
  const before = await commit(renewed, await stage(renewed, "public", "before renewal"));
  const listed = (await (await admin("")).json()).shares;
  assert.equal(listed.find((s) => s.id === pub).expiresAt, first.expiresAt);
  await get(`/_test/advance-clock?ms=${29 * DAY}`);
  const after = await commit(renewed, await stage(renewed, "public", "renewed"));
  assert.ok(Date.parse(after.expiresAt) - Date.parse(before.expiresAt) >= 29 * DAY, "re-sharing restarts the lifetime");
  await get(`/_test/advance-clock?ms=${DAY - 120000}`);
  assert.equal(await (await get(`/${pub}/`)).text(), "expiring");
  assert.equal(await (await get(`/${pin}/`, { Cookie: cookie })).text(), "expiring protected");
  const form = await challenge(pin);
  await get("/_test/advance-clock?ms=240000");
  for (const response of [await get(`/${pub}/`), await get(`/${pub}`), await get(`/${pin}/`, { Cookie: cookie })]) {
    assert.equal(response.status, 404);
    assert.equal(await response.text(), "not found");
    headers(response);
  }
  assert.equal((await unlock(pin, form, "482913")).status, 404, "an expired PIN link no longer unlocks");
  assert.equal(await (await get(`/${renewed}/`)).text(), "renewed");
  const bucket = await worker.getR2Bucket("BUCKET");
  const stored = async (prefix) => (await bucket.list({ prefix })).objects.length;
  assert.ok((await stored(`${pub}/`)) > 0);
  const { alarm } = await (await get("/_test/alarm?run")).json();
  const remaining = (await (await admin("")).json()).shares;
  assert.deepEqual(
    remaining.map((s) => s.id),
    [renewed],
  );
  assert.equal(await stored(`${pub}/`), 0);
  assert.equal(await stored(`${pin}/`), 0);
  assert.equal(await stored(`${renewed}/${before.version}/`), 0);
  assert.equal(await stored(`${renewed}/${after.version}/`), 1);
  assert.equal(alarm, Date.parse(after.expiresAt), "with only active shares left, the alarm waits for the next expiry");
  const again = await commit(pub, await stage(pub, "public", "shared again"));
  assert.equal(await (await get(`/${pub}/`)).text(), "shared again");
  assert.ok(Date.parse(again.expiresAt) > Date.parse(after.expiresAt));
});
test("a share stored before expiry existed gets an alarm on startup and on the deploy health check", async () => {
  const legacy = "Legacy1234567890";
  const receipt = await commit(legacy, await stage(legacy, "public", "legacy"));
  await get(`/_test/legacy?id=${legacy}`);
  assert.equal((await (await get("/_test/alarm")).json()).alarm, null);
  assert.deepEqual(await (await get("/_health")).json(), { sha: "local-test" });
  const health = (await (await get("/_test/alarm")).json()).alarm;
  await get(`/_test/legacy?id=${legacy}&restart`).catch(() => null);
  const { alarm } = await (await get("/_test/alarm")).json();
  assert.equal(health, alarm);
  const shares = (await (await admin("")).json()).shares;
  const listed = shares.find((s) => s.id === legacy);
  assert.equal(listed.expiresAt, new Date(Date.parse(receipt.updated) + 30 * 86400000).toISOString());
  assert.equal(
    alarm,
    Math.min(...shares.map((s) => Date.parse(s.expiresAt))),
    "the alarm wakes for the earliest expiry",
  );
});
