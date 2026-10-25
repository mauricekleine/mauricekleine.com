import { fonts } from "@mauricekleine/superthread/fonts";

export interface WorkerEnv {
  ASSETS: { fetch(input: Request | URL): Promise<Response> };
}

// the worker: static assets, plus the headers of the two paths that reach it first (cloudflare.config.ts). It sets
// them on the asset layer's response, and public/_headers has no rule for either path, so each header has one source.
// - /fonts/*: each face carries its licence's CORS rule from packages/superthread/fonts.ts: the OFL faces to anyone,
//   the ITF faces (Supreme, Erode) only to Maurice's own origins and to local development.
// - /r/v/*: the pinned registry snapshots, whose caching depends on whether the file exists, which a path rule
//   cannot see.
const ownOrigins = [
  /^https:\/\/([a-z0-9-]+\.)*mauricekleine\.com$/,
  /^https:\/\/(www\.)?mk\.wtf$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

const rule = new Map(fonts.map((face) => [face.file, face.acao]));

// The headers a face's response carries, or null when the path names no face in the manifest.
export function fontHeaders(path: string, origin: string | null): Record<string, string> | null {
  const file = /^\/fonts\/([^/]+)$/.exec(path)?.[1];
  const acao = file === undefined ? undefined : rule.get(file);
  if (acao === undefined) return null;
  const headers: Record<string, string> = {
    "cache-control": "public, max-age=31536000, immutable",
    vary: "Origin",
  };
  if (acao === "*") headers["access-control-allow-origin"] = "*";
  else if (origin !== null && ownOrigins.some((pattern) => pattern.test(origin)))
    headers["access-control-allow-origin"] = origin;
  return headers;
}

// The headers a snapshot response carries, from the asset layer's status. A published version never changes, so a
// file in it keeps for a year. A miss (a file no version has, or a version not published yet) is never stored, so a
// version is there on the first request after it ships. Since no client stores a miss, a 304 always answers a stored
// file, and it keeps the year too.
export function snapshotHeaders(status: number): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "cache-control": status === 200 || status === 304 ? "public, max-age=31536000, immutable" : "no-store",
  };
}

export async function handle(
  request: Request,
  env: WorkerEnv,
  next: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/r/v/")) {
    const response = await env.ASSETS.fetch(request);
    return withHeaders(response, snapshotHeaders(response.status));
  }
  if (!pathname.startsWith("/fonts/")) return next(request);

  const response = await env.ASSETS.fetch(request);
  const fontRule = response.status < 400 ? fontHeaders(pathname, request.headers.get("origin")) : null;
  if (fontRule === null) return response;
  // the rule decides the CORS header alone, so nothing upstream can widen it
  return withHeaders(response, fontRule, ["access-control-allow-origin"]);
}

// the asset layer's response, with the dropped headers removed and the given ones set over whatever it sent
function withHeaders(response: Response, set: Record<string, string>, drop: string[] = []): Response {
  const headers = new Headers(response.headers);
  for (const name of drop) headers.delete(name);
  for (const [name, value] of Object.entries(set)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
