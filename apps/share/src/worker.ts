import { DurableObject } from "cloudflare:workers";
import { pinPage } from "./pin-page";

const HOUR = 3600000;
const DAY = 24 * HOUR;
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
};
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
  const extension = path.split(".").pop()?.toLowerCase() || "";
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
  };
  return Object.hasOwn(types, extension) ? types[extension] : "application/octet-stream";
}
function receipt(upload: Upload) {
  const { id, mode, version, fingerprint, updated } = upload;
  return { id, mode, version, fingerprint, updated };
}
function spec(value: unknown): Omit<Upload, "id" | "version" | "received" | "expires" | "updated"> {
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
      file.size > 10 * 1024 * 1024 ||
      files.some((f) => f.path === file.path)
    )
      throw new Invalid(400, "invalid file");
    files.push({ path: file.path, size: file.size });
  }
  if (!files.some((f) => f.path === "index.html") || files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024)
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

export class ShareStore extends DurableObject<Env> {
  fetch(request: Request) {
    // Includes awaits on R2 and crypto: no concurrent PIN counter or pointer updates.
    return this.ctx.blockConcurrencyWhile(async () => {
      try {
        return await this.handle(request);
      } catch (error) {
        if (error instanceof Invalid) return json({ error: error.message }, error.status);
        return json({ error: "storage unavailable" }, 503);
      }
    });
  }
  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    let parts: string[];
    try {
      parts = url.pathname.split("/").slice(1).map(decodeURIComponent);
    } catch {
      return reply();
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
        await this.ctx.storage.setAlarm(Date.now() + HOUR);
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
        const upload: Upload = {
          ...spec(data),
          id,
          version: crypto.randomUUID(),
          received: [],
          expires: Date.now() + DAY,
          updated: new Date().toISOString(),
        };
        await this.ctx.storage.put(`upload:${id}:${upload.version}`, upload);
        await this.ctx.storage.setAlarm(Date.now() + HOUR);
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
        await this.ctx.storage.put(activeKey, upload);
        // Old snapshots are unreachable and reclaimed on the next alarm.
        if (active) await this.ctx.storage.put(`upload:${id}:${active.version}`, { ...active, expires: 0 });
        await this.ctx.storage.setAlarm(Date.now() + HOUR);
        return json(receipt(upload));
      }
      if (parts[5] === "files" && parts.length > 6 && request.method === "PUT") {
        if (active?.version === version) throw new Invalid(409, "committed snapshot is immutable");
        const path = parts.slice(6).join("/");
        const file = upload.files.find((f) => f.path === path);
        if (!validPath(path) || !file) return reply();
        const bytes = await bounded(request, file.size);
        if (bytes.length !== file.size) throw new Invalid(400, "file size mismatch");
        await this.env.BUCKET.put(`${id}/${version}/${path}`, bytes);
        if (!upload.received.includes(path)) upload.received.push(path);
        await this.ctx.storage.put(uploadKey, upload);
        return reply(null, 204);
      }
      return reply();
    }
    const id = parts[0];
    if (!id || !ID.test(id)) return reply();
    const active = await this.ctx.storage.get<Upload>(`share:${id}`);
    if (!active) return reply();
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
      if (path === "_unlock" && request.method === "POST") return this.unlock(request, active);
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
    if (!["GET", "HEAD"].includes(request.method) || !validPath(path) || !active.files.some((f) => f.path === path))
      return reply();
    const object = await this.env.BUCKET.get(`${id}/${active.version}/${path}`);
    if (!object) return reply();
    const type = contentType(path);
    return reply(request.method === "HEAD" ? null : object.body, 200, {
      "Content-Type": type,
      "Content-Length": String(object.size),
      ...(type === "application/octet-stream" ? { "Content-Disposition": "attachment" } : {}),
    });
  }
  async unlock(request: Request, active: Upload) {
    const form = new URLSearchParams(new TextDecoder().decode(await bounded(request, 2048)));
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
    const session = await signed(this.env.COOKIE_KEY, `session.${active.id}.${active.version}.${time + 30 * DAY}`);
    return reply(null, 303, {
      Location: `/${active.id}/`,
      "Set-Cookie": `__Secure-artifact-${active.id}=${session}; Path=/${active.id}/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
    });
  }
  async alarm() {
    await this.ctx.blockConcurrencyWhile(async () => {
      for (const [key, upload] of await this.ctx.storage.list<Upload>({ prefix: "upload:" })) {
        const active = await this.ctx.storage.get<Upload>(`share:${upload.id}`);
        if (active?.version === upload.version || upload.expires > Date.now()) continue;
        await this.env.BUCKET.delete(upload.files.map((f) => `${upload.id}/${upload.version}/${f.path}`));
        await this.ctx.storage.delete(key);
      }
      if ((await this.ctx.storage.list({ prefix: "upload:" })).size) await this.ctx.storage.setAlarm(Date.now() + HOUR);
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
    if (path === "/_health" && ["GET", "HEAD"].includes(request.method)) return json({ sha: env.BUILD_SHA });
    return env.STORE.get(env.STORE.idFromName("catalog-v1")).fetch(request);
  },
} satisfies ExportedHandler<Env>;
