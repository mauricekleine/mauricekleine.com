import { expect, test } from "bun:test";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { handleSiteRequest, type WorkerEnv } from "../src/server-behavior";

const site = "https://www.mauricekleine.com";
const endpoint = `${site}/mcp`;
const essayMarkdown = [
  "# Essay One",
  "",
  "2026-01-02 · first posted on [x](https://x.com/example/status/1)",
  "",
  "![](https://www.mauricekleine.com/essays/essay-one/01.jpg)",
  "",
  "---",
  "",
  "## heading",
  "",
  "This is the opening paragraph of essay one. It has some text.",
  "",
  "More paragraph text here.",
  "",
].join("\n");
const files: Record<string, string> = {
  "/api/maurice.json": '{"name":"maurice"}',
  "/api/projects.json": '[{"name":"project"}]',
  "/api/uptime.json": '{"status":"up"}',
  "/essays.md":
    "# essays\n\n- [essay one](https://www.mauricekleine.com/essays/essay-one.md) (2026-01-02) - summary one\n",
  "/essays/essay-one.md": essayMarkdown,
};

function assets(overrides: Record<string, string | undefined> = {}): WorkerEnv {
  return {
    ASSETS: {
      fetch: async (input) => {
        const path = new URL(input instanceof Request ? input.url : input.href)
          .pathname;
        const body = { ...files, ...overrides }[path];
        return body === undefined
          ? new Response("not found", { status: 404 })
          : new Response(body);
      },
    },
  };
}

function wire(request: Request, env = assets()) {
  const headers = new Headers(request.headers);
  headers.set("host", new URL(request.url).host);
  return handleSiteRequest(new Request(request, { headers }), env);
}

async function connect(modern: boolean, env = assets()) {
  const methods: string[] = [];
  const client = new Client(
    { name: "mcp-contract-test", version: "1.0.0" },
    modern
      ? { versionNegotiation: { mode: { pin: "2026-07-28" } } }
      : { supportedProtocolVersions: ["2025-06-18"] },
  );
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    fetch: async (url, init) => {
      const request = new Request(url, init);
      if (request.method === "POST")
        methods.push((await request.clone().json()).method);
      return wire(request, env);
    },
  });
  await client.connect(transport);
  return { client, methods };
}

function raw(
  method: string,
  params: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2026-07-28",
      "mcp-method": method,
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params: {
        ...params,
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientInfo": {
            name: "mcp-contract-test",
            version: "1.0.0",
          },
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    }),
  });
}

test("2026 discovery and ordered tool catalog need no initialize or session", async () => {
  const { client, methods } = await connect(true);
  try {
    expect(client.getProtocolEra()).toBe("modern");
    expect(
      client.getDiscoverResult()?._meta?.["io.modelcontextprotocol/serverInfo"],
    ).toMatchObject({
      name: "mauricekleine",
      title: "maurice kleine's personal site",
      version: "1.0.0",
    });
    expect(client.getDiscoverResult()).toMatchObject({
      ttlMs: 3_600_000,
      cacheScope: "public",
      supportedVersions: ["2026-07-28"],
      capabilities: { tools: { listChanged: false } },
    });
    expect(client.getDiscoverResult()?.instructions).toBe(
      "read-only tools about maurice kleine. everything here is public; no auth, no state, no tricks. markdown mirrors at /index.md, /about.md and /essays.md if you'd rather just read.",
    );
    const catalog = await client.listTools();
    expect(catalog.tools.map((tool) => tool.name)).toEqual([
      "about_maurice",
      "list_projects",
      "list_essays",
      "get_essay",
      "get_uptime",
      "make_a_wish",
    ]);
    expect(catalog.tools.map((tool) => tool.description)).toEqual([
      "who maurice kleine is: bio, role, location, background, links",
      "maurice's side quests and the graveyard of ended experiments, with statuses and epitaphs",
      "maurice's essays, newest first: slug, title, summary, date, links and cover image for each",
      "read one essay by slug. by default returns a teaser (title, summary, opening paragraph, links); pass full: true for the whole markdown",
      "operational status of maurice himself",
      "log a wish on a shooting star. results not guaranteed",
    ]);
    expect(catalog).toMatchObject({ ttlMs: 3_600_000, cacheScope: "public" });
    expect(catalog.tools[3].inputSchema.required).toEqual(["slug"]);
    expect(catalog.tools[3].inputSchema.properties?.slug.description).toBe(
      "essay slug, e.g. ride-the-floor-up",
    );
    expect(catalog.tools[5].inputSchema.properties?.wish.description).toBe(
      "the wish. keep it small, this is a small internet thing",
    );
    expect(methods).toEqual(["server/discover", "tools/list"]);
  } finally {
    await client.close();
  }
});

test("all six tools keep their text content and essay input behavior", async () => {
  const { client } = await connect(true);
  try {
    for (const [name, text] of [
      ["about_maurice", files["/api/maurice.json"]],
      ["list_projects", files["/api/projects.json"]],
      ["get_uptime", files["/api/uptime.json"]],
    ]) {
      expect((await client.callTool({ name, arguments: {} })).content).toEqual([
        { type: "text", text },
      ]);
    }
    const listed = await client.callTool({
      name: "list_essays",
      arguments: {},
    });
    expect(JSON.parse(listed.content[0].text)).toEqual([
      {
        slug: "essay-one",
        title: "essay one",
        summary: "summary one",
        date: "2026-01-02",
        url: `${site}/essays/essay-one`,
        markdown_url: `${site}/essays/essay-one.md`,
        cover: `${site}/essays/essay-one/01.jpg`,
      },
    ]);
    const teaser = JSON.parse(
      (
        await client.callTool({
          name: "get_essay",
          arguments: { slug: "essay-one" },
        })
      ).content[0].text,
    );
    expect(teaser.opening).toBe(
      "This is the opening paragraph of essay one. It has some text.",
    );
    expect(teaser.markdown).toBeUndefined();
    const full = JSON.parse(
      (
        await client.callTool({
          name: "get_essay",
          arguments: { slug: "essay-one", full: true },
        })
      ).content[0].text,
    );
    expect(full.markdown).toBe(essayMarkdown);
    expect(
      (
        await client.callTool({
          name: "make_a_wish",
          arguments: { wish: "clear skies" },
        })
      ).content,
    ).toEqual([
      {
        type: "text",
        text: 'wish logged: "clear skies". results not guaranteed.',
      },
    ]);
    expect(
      (await client.callTool({ name: "make_a_wish", arguments: {} })).content,
    ).toEqual([{ type: "text", text: "wish logged. results not guaranteed." }]);
    const invalidWish = await client.callTool({
      name: "make_a_wish",
      arguments: { wish: 12 },
    });
    expect(invalidWish.isError).toBe(true);
    expect(invalidWish.content[0].text).not.toContain("wish logged");
    const missing = await client.callTool({
      name: "get_essay",
      arguments: { slug: "missing" },
    });
    expect(missing.isError).toBe(true);
    expect(missing.content[0].text).toContain("unknown essay: missing");
  } finally {
    await client.close();
  }
});

test("failed asset fetch becomes a tool error", async () => {
  const { client } = await connect(
    true,
    assets({ "/api/maurice.json": undefined }),
  );
  try {
    const result = await client.callTool({
      name: "about_maurice",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("not found");
  } finally {
    await client.close();
  }
  const essayClient = await connect(true, assets({ "/essays.md": undefined }));
  try {
    const result = await essayClient.client.callTool({
      name: "list_essays",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("asset unavailable: /essays.md");
  } finally {
    await essayClient.client.close();
  }
});

test("2026 header and method errors use the HTTP binding", async () => {
  const mismatch = await wire(
    raw("tools/list", {}, { "mcp-method": "tools/call" }),
  );
  expect(mismatch.status).toBe(400);
  expect((await mismatch.json()).error.code).toBe(-32020);
  const wrongTool = await wire(
    raw(
      "tools/call",
      { name: "about_maurice", arguments: {} },
      { "mcp-name": "list_projects" },
    ),
  );
  expect(wrongTool.status).toBe(400);
  expect((await wrongTool.json()).error.code).toBe(-32020);
  const unknown = await wire(raw("not/a/method"));
  expect(unknown.status).toBe(404);
  expect((await unknown.json()).error.code).toBe(-32601);
});

test("Origin and Host guards run before dispatch and CORS reflects only allowed origins", async () => {
  const request = raw("tools/list");
  expect((await wire(request)).status).toBe(200);
  for (const origin of [
    site,
    "https://mauricekleine.com",
    "http://localhost:3000",
    "http://127.0.0.1:8787",
  ]) {
    const response = await wire(raw("tools/list", {}, { origin }));
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
  }
  for (const origin of [
    "https://evil.example",
    "http://www.mauricekleine.com",
    "https://localhost:3000",
    "null",
  ]) {
    expect((await wire(raw("tools/list", {}, { origin }))).status).toBe(403);
  }
  const preflight = await wire(
    new Request(endpoint, { method: "OPTIONS", headers: { origin: site } }),
  );
  expect(preflight.status).toBe(204);
  expect(preflight.headers.get("access-control-allow-origin")).toBe(site);
  for (const header of [
    "Content-Type",
    "MCP-Protocol-Version",
    "Mcp-Method",
    "Mcp-Name",
  ]) {
    expect(preflight.headers.get("access-control-allow-headers")).toContain(
      header,
    );
  }
  expect(
    (
      await wire(
        new Request(endpoint, {
          method: "OPTIONS",
          headers: { origin: "https://evil.example" },
        }),
      )
    ).status,
  ).toBe(403);
  const badHost = new Request(request, {
    headers: { ...Object.fromEntries(request.headers), host: "evil.example" },
  });
  expect((await handleSiteRequest(badHost, assets())).status).toBe(403);
});

test("2025 client still initializes and calls a tool on the same endpoint", async () => {
  const { client, methods } = await connect(false);
  try {
    expect(client.getProtocolEra()).toBe("legacy");
    expect(client.getNegotiatedProtocolVersion()).toBe("2025-06-18");
    expect(client.getServerVersion()?.name).toBe("mauricekleine");
    expect(methods[0]).toBe("initialize");
    expect(
      (await client.callTool({ name: "about_maurice", arguments: {} })).content,
    ).toEqual([{ type: "text", text: files["/api/maurice.json"] }]);
  } finally {
    await client.close();
  }
});
