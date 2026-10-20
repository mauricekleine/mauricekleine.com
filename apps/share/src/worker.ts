import { DurableObject } from "cloudflare:workers";
import { pinPage } from "./pin-page";

const HOUR = 3600000;
const DAY = 24 * HOUR;
const SHARE_LIFETIME = 30 * DAY;
const MiB = 1024 * 1024;
const MEDIA_EXTENSIONS = new Set(["mp4", "webm", "m4a", "mp3"]);
const ID = /^[a-zA-Z0-9]{10,32}$/;
const UUID = /^[a-f0-9-]{36}$/;
const HEX = /^[a-f0-9]{64}$/;
const SANDBOX =
  "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads";
const encoder = new TextEncoder();
type FileSpec = { path: string; size: number };
type Upload = {
  id: string;
  version: string;
  mode: "public" | "pin";
  fingerprint: string;
  salt?: string;
  pinHash?: string;
  files: FileSpec[];
  received: string[];
  expires: number;
  updated: string;
  // Set on the share pointer at commit; the client never chooses it.
  expiresAt?: number;
};
type FilePut = { key: string; uploadKey: string; path: string; size: number };
type Attempt = { failures: number[]; locked: number };

function reply(body: BodyInit | null = "not found", status = 404, headers: HeadersInit = {}) {
  const result = new Response(body, { status, headers });
  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  result.headers.set("Referrer-Policy", "no-referrer");
  result.headers.set("X-Content-Type-Options", "nosniff");
  result.headers.set("Cache-Control", "private, no-store");
  if (result.headers.get("Content-Type") !== "application/pdf") result.headers.set("Content-Security-Policy", SANDBOX);
  return result;
}
function json(value: unknown, status = 200) {
  return reply(JSON.stringify(value), status, { "Content-Type": "application/json" });
}
class Invalid extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function validPath(path: string) {
  return (
    path.length <= 512 &&
    path.split("/").every((part) => /^[a-zA-Z0-9_-][a-zA-Z0-9_. -]*$/.test(part) && part !== "_unlock")
  );
}
async function bounded(request: Request, limit: number) {
  if (Number(request.headers.get("Content-Length")) > limit) throw new Invalid(413, "too large");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new Invalid(413, "too large");
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}
// R2 needs a known-length stream. Count incoming bytes before forwarding them,
// and abort the write on a mismatch without buffering a media file in memory.
async function putFile(bucket: R2Bucket, key: string, request: Request, size: number) {
  if (Number(request.headers.get("Content-Length")) > size) throw new Invalid(413, "too large");
  const reader = request.body?.getReader();
  const read = async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        reader!.read(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Invalid(408, "upload idle timeout")), 30000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  if (!size) {
    try {
      if (reader) {
        while (true) {
          const { done, value } = await read();
          if (done) break;
          if (value.length) throw new Invalid(413, "too large");
        }
      }
      await bucket.put(key, new Uint8Array());
    } catch (error) {
      await reader?.cancel(error);
      throw error;
    }
    return;
  }
  const { readable, writable } = new FixedLengthStream(size);
  const writer = writable.getWriter();
  const pump = async () => {
    try {
      let received = 0;
      let tail: Uint8Array | undefined;
      if (reader) {
        while (true) {
          const { done, value } = await read();
          if (done) break;
          received += value.length;
          if (received > size) throw new Invalid(413, "too large");
          if (tail) await writer.write(tail);
          tail = value;
        }
      }
      if (received !== size) throw new Invalid(400, "file size mismatch");
      // R2 can commit as soon as the fixed byte count arrives. Retain the last
      // chunk until EOF so a trailing excess byte cannot replace a valid upload.
      if (tail) await writer.write(tail);
      await writer.close();
    } catch (error) {
      await Promise.allSettled([reader?.cancel(error), writer.abort(error)]);
      throw error;
    }
  };
  const [input, stored] = await Promise.allSettled([pump(), bucket.put(key, readable)]);
  if (input.status === "rejected") throw input.reason;
  if (stored.status === "rejected") throw stored.reason;
}
function extension(path: string) {
  return path.split(".").pop()?.toLowerCase() || "";
}
function byteRange(header: string | null, size: number): { offset: number; length: number } | "unsatisfiable" | null {
  // Malformed and multipart ranges fall back to the whole representation.
  const match = header?.trim().match(/^bytes=(\d*)-(\d*)$/i);
  if (!match || (!match[1] && !match[2])) return null;
  const offset = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (offset >= size || end < offset) return "unsatisfiable";
  return { offset, length: end - offset + 1 };
}
async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}
async function same(a: string, b: string) {
  return crypto.subtle.timingSafeEqual(await digest(a), await digest(b));
}
function hex(bytes: Uint8Array) {
  return Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join("");
}
async function hmac(key: string) {
  return crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}
async function signed(key: string, payload: string) {
  return (
    payload + "." + hex(new Uint8Array(await crypto.subtle.sign("HMAC", await hmac(key), encoder.encode(payload))))
  );
}
async function verify(key: string, token: string, prefix: string) {
  const split = token.lastIndexOf(".");
  const payload = token.slice(0, split),
    signature = token.slice(split + 1);
  if (!payload.startsWith(prefix) || !HEX.test(signature)) return false;
  const expires = Number(payload.slice(prefix.length).split(".")[0]);
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (n) => parseInt(n, 16));
  return crypto.subtle.verify("HMAC", await hmac(key), bytes, encoder.encode(payload));
}
function contentType(path: string) {
  const types: Record<string, string> = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    pdf: "application/pdf",
    css: "text/css; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    mjs: "text/javascript; charset=utf-8",
    json: "application/json",
    txt: "text/plain; charset=utf-8",
    md: "text/plain; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    mp4: "video/mp4",
    webm: "video/webm",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
  };
  const ext = extension(path);
  return Object.hasOwn(types, ext) ? types[ext] : "application/octet-stream";
}
// Shares committed before expiry existed count from their upload time.
function shareExpiry(share: Upload) {
  return share.expiresAt ?? Date.parse(share.updated) + SHARE_LIFETIME;
}
function receipt(share: Upload) {
  const { id, mode, version, fingerprint, updated } = share;
  return { id, mode, version, fingerprint, updated, expiresAt: new Date(shareExpiry(share)).toISOString() };
}
function spec(value: unknown): Omit<Upload, "id" | "version" | "received" | "expires" | "updated" | "expiresAt"> {
  if (!value || typeof value !== "object") throw new Invalid(400, "invalid manifest");
  const data = value as Record<string, unknown>;
  if (
    (data.mode !== "public" && data.mode !== "pin") ||
    typeof data.fingerprint !== "string" ||
    !HEX.test(data.fingerprint) ||
    !Array.isArray(data.files) ||
    !data.files.length ||
    data.files.length > 200
  )
    throw new Invalid(400, "invalid manifest");
  const files: FileSpec[] = [];
  for (const file of data.files) {
    if (
      !file ||
      typeof file.path !== "string" ||
      !validPath(file.path) ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      file.size > (MEDIA_EXTENSIONS.has(extension(file.path)) ? 95 : 10) * MiB ||
      files.some((f) => f.path === file.path)
    )
      throw new Invalid(400, "invalid file");
    files.push({ path: file.path, size: file.size });
  }
  if (!files.some((f) => f.path === "index.html") || files.reduce((n, f) => n + f.size, 0) > 100 * MiB)
    throw new Invalid(400, "invalid snapshot");
  if (
    data.mode === "pin" &&
    (typeof data.salt !== "string" ||
      !/^[a-f0-9]{32}$/.test(data.salt) ||
      typeof data.pinHash !== "string" ||
      !HEX.test(data.pinHash))
  )
    throw new Invalid(400, "invalid PIN hash");
  return {
    mode: data.mode,
    fingerprint: data.fingerprint,
    files,
    ...(data.mode === "pin" ? { salt: data.salt as string, pinHash: data.pinHash as string } : {}),
  };
}

// Unlock bodies come from anyone holding a PIN link, so they are read before the
// serialized section: a slow sender must never hold the store.
function isUnlock(request: Request) {
  if (request.method !== "POST") return false;
  try {
    const parts = new URL(request.url).pathname.split("/").slice(1).map(decodeURIComponent);
    return parts.length === 2 && parts[1] === "_unlock" && ID.test(parts[0]);
  } catch {
    return false;
  }
}

export class ShareStore extends DurableObject<Env> {
  private pending: Promise<void> = Promise.resolve();
  private inFlight = new Set<string>();
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(() => this.bootstrap());
  }
  // Serialize catalog operations, with file bodies streamed between queue entries.
  // blockConcurrencyWhile across an R2 streaming PUT deadlocks its input gate.
  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.pending.then(operation);
    this.pending = result.then(
      () => {},
      () => {},
    );
    return result;
  }
  // Shares stored before expiry existed may have no alarm; wake for the earliest one.
  // Runs on startup and on /_health, which deploy:verify polls after every deploy.
  async bootstrap() {
    if ((await this.ctx.storage.getAlarm()) !== null) return;
    let next = Infinity;
    for (const share of (await this.ctx.storage.list<Upload>({ prefix: "share:" })).values())
      next = Math.min(next, shareExpiry(share));
    if (next < Infinity) await this.ctx.storage.setAlarm(next);
  }
  async fetch(request: Request) {
    let form: URLSearchParams | undefined;
    if (isUnlock(request)) {
      try {
        form = new URLSearchParams(new TextDecoder().decode(await bounded(request, 2048)));
      } catch (error) {
        if (error instanceof Invalid) return json({ error: error.message }, error.status);
        throw error;
      }
    }
    try {
      // PIN counters, pointers and upload admission remain serialized, including
      // their R2 and crypto awaits. Only the admitted file body leaves the queue.
      const result = await this.serial(() => this.handle(request, form));
      if (result instanceof Response) return result;
      let stored = false;
      try {
        await putFile(this.env.BUCKET, result.key, request, result.size);
        stored = true;
      } finally {
        await this.serial(async () => {
          this.inFlight.delete(result.key);
          if (stored) {
            // Other files may have finished, or DELETE/the alarm may have revoked
            // this upload while it streamed. Never restore an old upload record.
            const upload = await this.ctx.storage.get<Upload>(result.uploadKey);
            if (!upload || upload.expires <= Date.now()) throw new Invalid(404, "not found");
            upload.received.push(result.path);
            await this.ctx.storage.put(result.uploadKey, upload);
          }
        });
      }
      return reply(null, 204);
    } catch (error) {
      if (error instanceof Invalid) return json({ error: error.message }, error.status);
      return json({ error: "storage unavailable" }, 503);
    }
  }
  async handle(request: Request, form?: URLSearchParams): Promise<Response | FilePut> {
    const url = new URL(request.url);
    let parts: string[];
    try {
      parts = url.pathname.split("/").slice(1).map(decodeURIComponent);
    } catch {
      return reply();
    }
    if (parts.length === 1 && parts[0] === "_health" && ["GET", "HEAD"].includes(request.method)) {
      await this.bootstrap();
      return json({ sha: this.env.BUILD_SHA });
    }
    const admin = parts[0] === "_admin";
    if (admin) {
      if (
        !this.env.ADMIN_TOKEN ||
        !(await same(request.headers.get("Authorization") || "", `Bearer ${this.env.ADMIN_TOKEN}`))
      )
        return reply("unauthorized", 401);
      if (parts[1] !== "shares") return reply();
      if (parts.length === 2 && request.method === "GET") {
        return json({ shares: [...(await this.ctx.storage.list<Upload>({ prefix: "share:" })).values()].map(receipt) });
      }
      const id = parts[2];
      if (!id || !ID.test(id)) return reply();
      const activeKey = `share:${id}`;
      if (parts.length === 3 && request.method === "DELETE") {
        await this.ctx.storage.delete(activeKey);
        await this.ctx.storage.delete(`attempt:${id}`);
        for (const [key, upload] of await this.ctx.storage.list<Upload>({ prefix: `upload:${id}:` })) {
          upload.expires = 0;
          await this.ctx.storage.put(key, upload);
        }
        await this.schedule(Date.now() + HOUR);
        return reply(null, 204);
      }
      if (parts[3] !== "uploads") return reply();
      if (parts.length === 4 && request.method === "POST") {
        let data;
        try {
          data = JSON.parse(new TextDecoder().decode(await bounded(request, 65536)));
        } catch (error) {
          if (error instanceof Invalid) throw error;
          throw new Invalid(400, "invalid JSON");
        }
        const time = Date.now();
        const upload: Upload = {
          ...spec(data),
          id,
          version: crypto.randomUUID(),
          received: [],
          expires: time + DAY,
          updated: new Date(time).toISOString(),
        };
        await this.ctx.storage.put(`upload:${id}:${upload.version}`, upload);
        await this.schedule(Date.now() + HOUR);
        return json({ upload: upload.version }, 201);
      }
      const version = parts[4];
      if (!version || !UUID.test(version)) return reply();
      const uploadKey = `upload:${id}:${version}`;
      const upload = await this.ctx.storage.get<Upload>(uploadKey);
      const active = await this.ctx.storage.get<Upload>(activeKey);
      if (!upload || (upload.expires <= Date.now() && active?.version !== version)) return reply();
      if (parts.length === 6 && parts[5] === "commit" && request.method === "POST") {
        if (active?.version === version) return json(receipt(active));
        if (upload.received.length !== upload.files.length) throw new Invalid(409, "incomplete upload");
        // Committing, including re-sharing, starts a fresh lifetime.
        const share = { ...upload, expiresAt: Date.now() + SHARE_LIFETIME };
        await this.ctx.storage.put(activeKey, share);
        // Old snapshots are unreachable and reclaimed on the next alarm.
        if (active) await this.ctx.storage.put(`upload:${id}:${active.version}`, { ...active, expires: 0 });
        await this.schedule(Date.now() + HOUR);
        return json(receipt(share));
      }
      if (parts[5] === "files" && parts.length > 6 && request.method === "PUT") {
        if (active?.version === version) throw new Invalid(409, "committed snapshot is immutable");
        const path = parts.slice(6).join("/");
        const file = upload.files.find((f) => f.path === path);
        if (!validPath(path) || !file) return reply();
        if (upload.received.includes(path)) {
          // The CLI retries all files of a fingerprint-bound pending upload.
          // A received object is immutable even before the snapshot commits.
          if (request.body) this.ctx.waitUntil(request.body.cancel());
          return reply(null, 204);
        }
        const key = `${id}/${version}/${path}`;
        if (this.inFlight.has(key)) throw new Invalid(409, "file upload in progress");
        this.inFlight.add(key);
        return { key, uploadKey, path, size: file.size };
      }
      return reply();
    }
    const id = parts[0];
    if (!id || !ID.test(id)) return reply();
    const active = await this.ctx.storage.get<Upload>(`share:${id}`);
    if (!active) return reply();
    // An expired link answers like a revoked one; the alarm reclaims it.
    if (shareExpiry(active) <= Date.now()) {
      await this.schedule(Date.now());
      return reply();
    }
    if (parts.length === 1 && (request.method === "GET" || request.method === "HEAD"))
      return reply(null, 302, { Location: `/${id}/` });
    const path = parts.slice(1).join("/") || "index.html";
    if (active.mode === "pin") {
      const prefix = `session.${id}.${active.version}.`;
      const cookie =
        request.headers
          .get("Cookie")
          ?.split(";")
          .map((s) => s.trim())
          .find((s) => s.startsWith(`__Secure-artifact-${id}=`))
          ?.split("=")
          .slice(1)
          .join("=") || "";
      if (form) return this.unlock(request, form, active);
      if (!(await verify(this.env.COOKIE_KEY, cookie, prefix))) {
        if (!["GET", "HEAD"].includes(request.method)) return reply();
        const challenge = await signed(
          this.env.COOKIE_KEY,
          `form.${id}.${active.version}.${Date.now() + 600000}.${crypto.randomUUID()}`,
        );
        const response = reply(request.method === "HEAD" ? null : pinPage(id, challenge), 200, {
          "Content-Type": "text/html; charset=utf-8",
        });
        response.headers.set(
          "Content-Security-Policy",
          `${SANDBOX}; default-src 'none'; style-src 'unsafe-inline'; font-src https://www.mauricekleine.com/fonts/; form-action ${url.origin}/${id}/; frame-ancestors 'none'; base-uri 'none'`,
        );
        return response;
      }
    }
    const file = active.files.find((f) => f.path === path);
    if (!["GET", "HEAD"].includes(request.method) || !validPath(path) || !file) return reply();
    const range = byteRange(request.headers.get("Range"), file.size);
    const key = `${id}/${active.version}/${path}`;
    const metadataOnly = request.method === "HEAD" || range === "unsatisfiable";
    const content = metadataOnly ? null : await this.env.BUCKET.get(key, range ? { range } : undefined);
    const object = metadataOnly ? await this.env.BUCKET.head(key) : content;
    if (!object) return reply();
    const type = contentType(path);
    const length = range === "unsatisfiable" ? 0 : range ? range.length : object.size;
    return reply(content?.body ?? null, range === "unsatisfiable" ? 416 : range ? 206 : 200, {
      "Content-Type": type,
      "Content-Length": String(length),
      "Accept-Ranges": "bytes",
      ...(range
        ? {
            "Content-Range":
              range === "unsatisfiable"
                ? `bytes */${object.size}`
                : `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`,
          }
        : {}),
      ...(type === "application/octet-stream" ? { "Content-Disposition": "attachment" } : {}),
    });
  }
  async unlock(request: Request, form: URLSearchParams, active: Upload) {
    if (
      request.headers.get("Content-Type")?.split(";")[0] !== "application/x-www-form-urlencoded" ||
      !(await verify(this.env.COOKIE_KEY, form.get("challenge") || "", `form.${active.id}.${active.version}.`))
    )
      return reply("invalid form; reload the link", 403);
    const key = `attempt:${active.id}`;
    const time = Date.now();
    const attempt = (await this.ctx.storage.get<Attempt>(key)) || { failures: [], locked: 0 };
    if (attempt.locked > time)
      return reply("this link is locked. try again in an hour.", 429, {
        "Retry-After": String(Math.ceil((attempt.locked - time) / 1000)),
      });
    attempt.locked = 0;
    attempt.failures = attempt.failures.filter((at) => time - at < HOUR);
    const pin = form.get("pin") || "";
    const actual = hex(await digest(`${active.salt}:${pin}`));
    if (!/^\d{6}$/.test(pin) || !(await same(actual, active.pinHash!))) {
      attempt.failures.push(time);
      if (attempt.failures.length >= 5) attempt.locked = time + HOUR;
      await this.ctx.storage.put(key, attempt);
      return reply(
        attempt.locked
          ? "this link is locked. try again in an hour."
          : "that PIN did not match. go back and try again.",
        attempt.locked ? 429 : 403,
        attempt.locked ? { "Retry-After": "3600" } : {},
      );
    }
    const until = Math.min(time + 30 * DAY, shareExpiry(active));
    const session = await signed(this.env.COOKIE_KEY, `session.${active.id}.${active.version}.${until}`);
    return reply(null, 303, {
      Location: `/${active.id}/`,
      "Set-Cookie": `__Secure-artifact-${active.id}=${session}; Path=/${active.id}/; Max-Age=${Math.ceil((until - time) / 1000)}; HttpOnly; Secure; SameSite=Lax`,
    });
  }
  // Keeps the earliest pending wake-up: setAlarm alone would replace it.
  async schedule(at: number) {
    const current = await this.ctx.storage.getAlarm();
    if (current === null || at < current) await this.ctx.storage.setAlarm(at);
  }
  async alarm() {
    await this.serial(async () => {
      const time = Date.now();
      let next = Infinity;
      for (const [key, share] of await this.ctx.storage.list<Upload>({ prefix: "share:" })) {
        const expiry = shareExpiry(share);
        if (expiry > time) {
          next = Math.min(next, expiry);
          continue;
        }
        // Revoke like DELETE, leaving staged re-shares of the same link alone.
        await this.ctx.storage.delete(key);
        await this.ctx.storage.delete(`attempt:${share.id}`);
        await this.ctx.storage.put(`upload:${share.id}:${share.version}`, { ...share, expires: 0 });
      }
      for (const [key, upload] of await this.ctx.storage.list<Upload>({ prefix: "upload:" })) {
        const active = await this.ctx.storage.get<Upload>(`share:${upload.id}`);
        if (active?.version === upload.version) continue;
        if (upload.expires > time) {
          next = Math.min(next, time + HOUR);
          continue;
        }
        await this.env.BUCKET.delete(upload.files.map((f) => `${upload.id}/${upload.version}/${f.path}`));
        await this.ctx.storage.delete(key);
      }
      if (next < Infinity) await this.ctx.storage.setAlarm(next);
    });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/_admin/")) {
      const token = request.headers.get("Authorization") || "";
      if (!env.ADMIN_TOKEN || !(await same(token, `Bearer ${env.ADMIN_TOKEN}`))) return reply("unauthorized", 401);
    }
    if (isUnlock(request)) {
      // Buffer the capped form here so the store only ever receives a complete body.
      try {
        request = new Request(request, { body: await bounded(request, 2048) });
      } catch (error) {
        if (error instanceof Invalid) return json({ error: error.message }, error.status);
        throw error;
      }
    }
    return env.STORE.get(env.STORE.idFromName("catalog-v1")).fetch(request);
  },
} satisfies ExportedHandler<Env>;
