// the worker: static assets plus two hand-written niceties.
// 1. markdown content negotiation: Accept: text/markdown on /, /about, /essays and /essays/*
// 2. a tiny mcp server at /mcp. yes, a personal site with an mcp server.
// no sdk, no framework. it's json-rpc over http, we can type that by hand.

// every html page has a hand-written .md twin next to it
function markdownMirror(pathname) {
  if (pathname === "/") return "/index.md";
  if (/^\/(about|essays|essays\/[a-z0-9-]+)$/.test(pathname)) return `${pathname}.md`;
  return null;
}

// the html page a .md twin mirrors, for the canonical link
function htmlForMirror(pathname) {
  if (pathname === "/index.md") return "/";
  const m = /^\/(about|essays|essays\/[a-z0-9-]+)\.md$/.exec(pathname);
  return m ? `/${m[1]}` : null;
}

// true only when the client prefers markdown over html, q-values included.
// googlebot sends */* (or text/html first) and gets html; agents that ask
// for text/markdown outright get the twin.
function prefersMarkdown(accept) {
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

function withHeaders(res, extra) {
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

const TOOLS = [
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

function rpcResult(id, result) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: JSON_HEADERS,
  });
}

function rpcError(id, code, message) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }),
    { status: 200, headers: JSON_HEADERS }
  );
}

async function handleMcp(request, env, origin) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  if (request.method !== "POST") {
    return new Response("mcp lives here. POST json-rpc, get maurice.", {
      status: 405,
      headers: { allow: "POST, OPTIONS", "content-type": "text/plain" },
    });
  }

  let msg;
  try {
    msg = await request.json();
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
      const res = await env.ASSETS.fetch(new URL(tool.asset, origin));
      const text = await res.text();
      return rpcResult(id, { content: [{ type: "text", text }] });
    }

    default:
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // apex to www, handled here so the redirect lives in the repo
    if (url.hostname === "mauricekleine.com") {
      url.hostname = "www.mauricekleine.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/mcp") {
      return handleMcp(request, env, url.origin);
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
  },
};
