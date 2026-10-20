import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createHash } from "node:crypto";
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
function headers(response, pdf = false) {
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  if (pdf) assert.equal(response.headers.get("Content-Security-Policy"), null);
  else assert.match(response.headers.get("Content-Security-Policy"), /^sandbox allow-scripts/);
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
  headers(response, true);
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
