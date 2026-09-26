export interface WorkerEnv {
  ASSETS: { fetch(input: Request | URL): Promise<Response> };
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  TURNSTILE_SECRET?: string;
  SUBSCRIBE_SECRET?: string;
}

type SubscribePage = {
  title: string;
  description: string;
  heading: string;
  message: string;
  back: { href: string; label: string };
};

type RpcMessage = {
  id?: unknown;
  method?: string;
  params?: { name?: string; arguments?: { slug?: string; full?: boolean; wish?: string } };
};

// the worker: static assets plus three hand-written niceties.
// 1. markdown content negotiation: Accept: text/markdown on /, /about, /essays and /essays/*
// 2. a tiny mcp server at /mcp. yes, a personal site with an mcp server.
// 3. essay email signup with double opt-in: POST /subscribe, GET /subscribe/confirm
// no sdk, no framework. it's json-rpc over http and hand-rolled webcrypto, we can type that by hand.

// every html page has a hand-written .md twin next to it
function markdownMirror(pathname: string): string | null {
  if (pathname === "/") return "/index.md";
  if (/^\/(about|essays|essays\/[a-z0-9-]+)$/.test(pathname)) return `${pathname}.md`;
  return null;
}

// the html page a .md twin mirrors, for the canonical link
function htmlForMirror(pathname: string): string | null {
  if (pathname === "/index.md") return "/";
  const m = /^\/(about|essays|essays\/[a-z0-9-]+)\.md$/.exec(pathname);
  return m ? `/${m[1]}` : null;
}

// true only when the client prefers markdown over html, q-values included.
// googlebot sends */* (or text/html first) and gets html; agents that ask
// for text/markdown outright get the twin.
function prefersMarkdown(accept: string): boolean {
  let md = 0;
  let html = 0;
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam ? parseFloat(qParam.slice(2)) : 1;
    if (Number.isNaN(q)) continue;
    if (type.trim() === "text/markdown") md = Math.max(md, q);
    if (type.trim() === "text/html") html = Math.max(html, q);
  }
  return md > 0 && md > html;
}

function withHeaders(res: Response, extra: Record<string, string>): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
  return out;
}

const MCP_PROTOCOL = "2025-06-18";

const SERVER_INFO = {
  name: "mauricekleine",
  title: "maurice kleine's personal site",
  version: "1.0.0",
};

const TOOLS: Array<{ name: string; description: string; inputSchema: object; asset?: string }> = [
  {
    name: "about_maurice",
    description:
      "who maurice kleine is: bio, role, location, background, links",
    inputSchema: { type: "object", properties: {} },
    asset: "/api/maurice.json",
  },
  {
    name: "list_projects",
    description:
      "maurice's side quests and the graveyard of ended experiments, with statuses and epitaphs",
    inputSchema: { type: "object", properties: {} },
    asset: "/api/projects.json",
  },
  {
    name: "list_essays",
    description:
      "maurice's essays, newest first: slug, title, summary, date, links and cover image for each",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_essay",
    description:
      "read one essay by slug. by default returns a teaser (title, summary, opening paragraph, links); pass full: true for the whole markdown",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "essay slug, e.g. ride-the-floor-up" },
        full: { type: "boolean", description: "return the full essay markdown instead of a teaser" },
      },
      required: ["slug"],
    },
  },
  {
    name: "get_uptime",
    description: "operational status of maurice himself",
    inputSchema: { type: "object", properties: {} },
    asset: "/api/uptime.json",
  },
  {
    name: "make_a_wish",
    description: "log a wish on a shooting star. results not guaranteed",
    inputSchema: {
      type: "object",
      properties: {
        wish: {
          type: "string",
          description: "the wish. keep it small, this is a small internet thing",
        },
      },
    },
  },
];

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, mcp-protocol-version",
};

function rpcResult(id: unknown, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: JSON_HEADERS,
  });
}

function rpcError(id: unknown, code: number, message: string): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }),
    { status: 200, headers: JSON_HEADERS }
  );
}

// essays.md lines look like:
// - [title](https://www.mauricekleine.com/essays/slug.md) (2026-09-13) - summary
function parseEssayIndex(markdown: string, origin: string) {
  const re = /^- \[(.+?)\]\((.+?)\.md\) \((\d{4}-\d{2}-\d{2})\) - (.+)$/gm;
  const essays: Array<{ slug: string; title: string; summary: string; date: string; url: string; markdown_url: string; cover: string }> = [];
  let m;
  while ((m = re.exec(markdown))) {
    const [, title, mdUrl, date, summary] = m;
    const slugMatch = /\/essays\/([a-z0-9-]+)$/.exec(mdUrl);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    essays.push({
      slug,
      title,
      summary,
      date,
      url: `${origin}/essays/${slug}`,
      markdown_url: `${origin}/essays/${slug}.md`,
      cover: `${origin}/essays/${slug}/01.jpg`,
    });
  }
  return essays;
}

// the first real paragraph of an essay's .md twin: skip the h1, the date/
// source line, the cover image and any divider, then take the next block.
function essayOpening(markdown: string): string {
  const blocks = markdown.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    if (/^#{1,6}\s/.test(block)) continue;
    if (/^!\[/.test(block)) continue;
    if (/^-{3,}$/.test(block)) continue;
    if (/^\d{4}-\d{2}-\d{2}\s·/.test(block)) continue;
    return block.replace(/\s+/g, " ").trim();
  }
  return "";
}

async function fetchText(env: WorkerEnv, origin: string, path: string): Promise<string | null> {
  const res = await env.ASSETS.fetch(new URL(path, origin));
  return res.ok ? await res.text() : null;
}

async function listEssays(env: WorkerEnv, origin: string) {
  const md = await fetchText(env, origin, "/essays.md");
  return md ? parseEssayIndex(md, origin) : [];
}

async function getEssay(env: WorkerEnv, origin: string, slug: string | undefined, full: boolean) {
  if (!slug) return null;
  const essays = await listEssays(env, origin);
  const entry = essays.find((e) => e.slug === slug);
  if (!entry) return null;
  const body = (await fetchText(env, origin, `/essays/${slug}.md`)) || "";
  const teaser = { ...entry, opening: essayOpening(body) };
  return full ? { ...teaser, markdown: body } : teaser;
}

async function handleMcp(request: Request, env: WorkerEnv, origin: string): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  if (request.method !== "POST") {
    return new Response("mcp lives here. POST json-rpc, get maurice.", {
      status: 405,
      headers: { allow: "POST, OPTIONS", "content-type": "text/plain" },
    });
  }

  let msg: RpcMessage;
  try {
    msg = await request.json() as RpcMessage;
  } catch {
    return rpcError(null, -32700, "parse error");
  }

  const { id, method, params } = msg;

  // notifications get a quiet nod
  if (method && method.startsWith("notifications/")) {
    return new Response(null, { status: 202 });
  }

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: MCP_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "read-only tools about maurice kleine. everything here is public; no auth, no state, no tricks. markdown mirrors at /index.md, /about.md and /essays.md if you'd rather just read.",
      });

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, {
        tools: TOOLS.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        })),
      });

    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return rpcError(id, -32602, `unknown tool: ${params?.name}`);
      if (tool.name === "make_a_wish") {
        const wish = params?.arguments?.wish;
        return rpcResult(id, {
          content: [
            {
              type: "text",
              text: wish
                ? `wish logged: "${wish}". results not guaranteed.`
                : "wish logged. results not guaranteed.",
            },
          ],
        });
      }
      if (tool.name === "list_essays") {
        const essays = await listEssays(env, origin);
        return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(essays) }] });
      }
      if (tool.name === "get_essay") {
        const slug = params?.arguments?.slug;
        const essay = await getEssay(env, origin, slug, Boolean(params?.arguments?.full));
        if (!essay) return rpcError(id, -32602, `unknown essay: ${slug}`);
        return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(essay) }] });
      }
      if (!tool.asset) return rpcError(id, -32603, "tool asset unavailable");
      const res = await env.ASSETS.fetch(new URL(tool.asset, origin));
      const text = await res.text();
      return rpcResult(id, { content: [{ type: "text", text }] });
    }

    default:
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

// --- essay signup: double opt-in via a signed, expiring token ---

function toBase64Url(bytes: string | ArrayBuffer): string {
  const bin = typeof bytes === "string" ? bytes : String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

async function hmacSha256(secret: string, message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const SUBSCRIBE_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days, in seconds

async function makeSubscribeToken(secret: string, email: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SUBSCRIBE_TOKEN_TTL;
  const payload = `${email}.${expiry}`;
  const sig = await hmacSha256(secret, payload);
  return `${toBase64Url(payload)}.${toBase64Url(sig)}`;
}

// returns { email, expired: false } | { email, expired: true } | null (bad signature/shape)
async function verifySubscribeToken(secret: string, token: string | null): Promise<{ email: string; expired: boolean } | null> {
  const parts = (token || "").split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  let payload;
  try {
    payload = fromBase64Url(payloadB64);
  } catch {
    return null;
  }
  const expectedSig = toBase64Url(await hmacSha256(secret, payload));
  if (!constantTimeEqual(expectedSig, sigB64)) return null;
  const match = /^(.+)\.(\d+)$/.exec(payload);
  if (!match) return null;
  const [, email, expiryStr] = match;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry)) return null;
  return { email, expired: Date.now() / 1000 > expiry };
}

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function wantsJson(request: Request): boolean {
  return (request.headers.get("accept") || "").includes("application/json");
}

async function parseSubscribeBody(request: Request): Promise<{ email: string; turnstileToken: string }> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return {
      email: (body.email || "").toString().trim(),
      turnstileToken: (body["cf-turnstile-response"] || body.turnstileToken || "").toString(),
    };
  }
  const form = await request.formData().catch(() => null);
  if (!form) return { email: "", turnstileToken: "" };
  return {
    email: (form.get("email") || "").toString().trim(),
    turnstileToken: (form.get("cf-turnstile-response") || "").toString(),
  };
}

async function verifyTurnstile(secret: string, token: string, remoteip: string | null): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({ success: false }));
  return Boolean(data.success);
}

// resend's create is an upsert: re-creating an existing contact overwrites
// `unsubscribed`, so only create when the lookup 404s. a confirmed reader who
// fills in the form again stays subscribed and just gets another link.
async function resendCreateContact(env: WorkerEnv, email: string): Promise<boolean> {
  const headers = { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" };
  const existing = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, { headers });
  if (existing.ok) return true;
  if (existing.status !== 404) {
    console.error("subscribe: resend contact lookup failed", existing.status, await existing.text().catch(() => ""));
    return false;
  }
  const res = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, unsubscribed: true }),
  });
  if (res.ok) return true;
  console.error("subscribe: resend contact create failed", res.status, await res.text().catch(() => ""));
  return false;
}

async function resendConfirmContact(env: WorkerEnv, email: string): Promise<boolean> {
  const patch = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ unsubscribed: false }),
  });
  if (!patch.ok) {
    console.error("subscribe/confirm: resend contact patch failed", patch.status, await patch.text().catch(() => ""));
    return false;
  }
  const segment = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${env.RESEND_SEGMENT_ID}`,
    { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } }
  );
  if (!segment.ok) {
    console.error("subscribe/confirm: resend segment add failed", segment.status, await segment.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendConfirmationEmail(env: WorkerEnv, email: string, token: string, origin: string): Promise<boolean> {
  const link = `${origin}/subscribe/confirm?t=${encodeURIComponent(token)}`;
  const text = `hey,\n\nsomeone (hopefully you) asked for new essays from mauricekleine.com. click to confirm:\n\n${link}\n\ndidn't ask? ignore this and nothing happens.\n\n- maurice\n`;
  const html = `<p>hey,</p><p>someone (hopefully you) asked for new essays from mauricekleine.com. click to confirm:</p><p><a href="${link}">${link}</a></p><p>didn't ask? ignore this and nothing happens.</p><p>- maurice</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: "maurice kleine <hey@mauricekleine.com>",
      to: email,
      subject: "confirm: new essays from maurice",
      html,
      text,
    }),
  });
  if (!res.ok) {
    console.error("subscribe: resend email send failed", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

// small, self-contained page in the site's visual system, for the no-js path
function subscribePage({ title, description, heading, message, back }: SubscribePage): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - Maurice Kleine</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#11131f" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/maurice.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/panchang-800.woff2" crossorigin />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/supreme-400.woff2" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/style.css?v=20260925-subscribe" />
  </head>
  <body>
    <canvas id="nebula" aria-hidden="true"></canvas>
    <canvas id="stars" aria-hidden="true"></canvas>
    <main class="lost">
      <header class="hero">
        <h1>${heading}</h1>
        <p class="tagline">${message}</p>
      </header>
      <section aria-label="where to go next">
        <p class="more-link"><a href="${back.href}">${back.label}</a></p>
      </section>
    </main>
    <script src="/texture.js"></script>
    <script src="/stars.js"></script>
    <script async src="https://api.mauricekleine.com/latest.js"></script>
  </body>
</html>
`;
}

function subscribeErrorResponse(request: Request, status: number, message: string): Response {
  if (wantsJson(request)) {
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return new Response(
    subscribePage({
      title: "subscription failed",
      description: message,
      heading: "that didn't work",
      message,
      back: { href: "/essays", label: "← back to essays" },
    }),
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

async function handleSubscribe(request: Request, env: WorkerEnv, url: URL): Promise<Response> {
  const missing = (["RESEND_API_KEY", "TURNSTILE_SECRET", "SUBSCRIBE_SECRET"] as const).filter((k) => !env[k]);
  if (missing.length) {
    console.error("subscribe: missing required secret(s):", missing.join(", "));
    return subscribeErrorResponse(request, 500, "subscriptions are misconfigured right now. try again later.");
  }

  const { email, turnstileToken } = await parseSubscribeBody(request);
  if (!isValidEmail(email)) {
    return subscribeErrorResponse(request, 400, "that doesn't look like a valid email.");
  }
  if (!turnstileToken) {
    return subscribeErrorResponse(request, 400, "couldn't verify you're human. try again.");
  }

  const human = await verifyTurnstile(env.TURNSTILE_SECRET!, turnstileToken, request.headers.get("cf-connecting-ip"));
  if (!human) {
    return subscribeErrorResponse(request, 400, "couldn't verify you're human. try again.");
  }

  // never reveal whether this email was already subscribed
  const contactOk = await resendCreateContact(env, email);
  if (!contactOk) {
    return subscribeErrorResponse(request, 500, "couldn't save your subscription. try again in a bit.");
  }

  const token = await makeSubscribeToken(env.SUBSCRIBE_SECRET!, email);
  const emailed = await sendConfirmationEmail(env, email, token, url.origin);
  if (!emailed) {
    return subscribeErrorResponse(request, 500, "couldn't send the confirmation email. try again in a bit.");
  }

  if (wantsJson(request)) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return new Response(
    subscribePage({
      title: "check your inbox",
      description: "confirm your subscription to new essays from maurice kleine",
      heading: "almost there",
      message: "check your inbox for a confirmation link.",
      back: { href: "/essays", label: "← back to essays" },
    }),
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

async function handleSubscribeConfirm(request: Request, env: WorkerEnv, url: URL): Promise<Response> {
  const missing = (["RESEND_API_KEY", "RESEND_SEGMENT_ID", "SUBSCRIBE_SECRET"] as const).filter((k) => !env[k]);
  if (missing.length) {
    console.error("subscribe/confirm: missing required secret(s):", missing.join(", "));
    return new Response("confirmation is misconfigured right now. try again later.", { status: 500 });
  }

  const verified = await verifySubscribeToken(env.SUBSCRIBE_SECRET!, url.searchParams.get("t"));
  if (!verified || verified.expired) {
    return new Response(
      subscribePage({
        title: "link expired",
        description: "this confirmation link is no longer valid",
        heading: "that link's gone stale",
        message: "confirmation links expire after 7 days. subscribe again and we'll send a fresh one.",
        back: { href: "/essays", label: "← back to essays" },
      }),
      { status: 410, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  const confirmed = await resendConfirmContact(env, verified.email);
  if (!confirmed) {
    return new Response("couldn't confirm your subscription. try again in a bit.", { status: 500 });
  }

  return new Response(
    subscribePage({
      title: "you're in",
      description: "subscribed to new essays from maurice kleine",
      heading: "you're in",
      message: "next essay lands in your inbox.",
      back: { href: "/essays", label: "← read the essays so far" },
    }),
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function handleSiteRequest(
  request: Request,
  env: WorkerEnv,
  renderPage?: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
    const url = new URL(request.url);

    // apex to www, handled here so the redirect lives in the repo
    if (url.hostname === "mauricekleine.com") {
      url.hostname = "www.mauricekleine.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/mcp") {
      return handleMcp(request, env, url.origin);
    }

    if (url.pathname === "/subscribe" && request.method === "POST") {
      return handleSubscribe(request, env, url);
    }
    if (url.pathname === "/subscribe/confirm" && request.method === "GET") {
      return handleSubscribeConfirm(request, env, url);
    }

    // markdown for agents, the hand-written edition
    const mirror = markdownMirror(url.pathname);
    const accept = request.headers.get("accept") || "";
    if (mirror && prefersMarkdown(accept)) {
      const res = await env.ASSETS.fetch(new URL(mirror, url.origin));
      if (res.ok) {
        const body = await res.text();
        return new Response(body, {
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "x-markdown-tokens": String(Math.ceil(body.length / 4)),
            link: `<${url.origin}${url.pathname}>; rel="canonical"`,
            "cache-control": "public, max-age=300",
            vary: "accept",
          },
        });
      }
      // no twin: fall through so a missing essay is a real 404
    }

    const res = await env.ASSETS.fetch(request);

    // The immutable image-path rule must not cache a missing page for a year.
    if (res.status === 404) {
      // During prerendering, the generated HTML is not in ASSETS yet.
      // The app handler also supplies a real 404 for an unknown essay.
      // Cloudflare's HTML asset handling asks for slash forms during prerender.
      const pagePath = url.pathname.endsWith("/") && url.pathname !== "/"
        ? url.pathname.slice(0, -1)
        : url.pathname;
      if ((markdownMirror(pagePath) || pagePath === "/404") && renderPage && (request.method === "GET" || request.method === "HEAD")) {
        const renderUrl = new URL(request.url);
        renderUrl.pathname = pagePath;
        const rendered = await renderPage(new Request(renderUrl, request));
        if (rendered.ok) return withHeaders(rendered, { vary: "accept" });
      }
      return withHeaders(res, {
        "cache-control": "public, max-age=0, must-revalidate",
        ...(mirror ? { vary: "accept" } : {}),
      });
    }

    // Static assets verifies that a page exists before normalizing its URL.
    // Make only those HTML aliases permanent; leave other redirects alone.
    const location = res.headers.get("location");
    if ((request.method === "GET" || request.method === "HEAD") && res.status === 307 && location) {
      const target = new URL(location, url);
      const alias = target.pathname === "/"
        ? url.pathname === "/index.html" || url.pathname === "/index"
        : url.pathname === `${target.pathname}.html` || url.pathname === `${target.pathname}/`;
      if (alias && markdownMirror(target.pathname) && target.origin === url.origin && target.search === url.search) {
        return new Response(res.body, { status: 308, headers: res.headers });
      }
    }

    // the .md twins are readable duplicates of the html; say which page is canonical
    const canonical = htmlForMirror(url.pathname);
    if (canonical && res.ok) {
      return withHeaders(res, { link: `<${url.origin}${canonical}>; rel="canonical"` });
    }
    if (mirror) {
      return withHeaders(res, { vary: "accept" });
    }
    return res;
}
