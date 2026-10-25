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

// The headers a snapshot response carries, from whether the file exists. A published version never changes, so a
// file in it keeps for a year, and so does a 304 for it. A miss (a file no version has, or a version not published
// yet) is never stored, so a version is there on the first request after it ships.
export function snapshotHeaders(exists: boolean): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "cache-control": exists ? "public, max-age=31536000, immutable" : "no-store",
  };
}

// A snapshot file through the asset layer. Its 304 does not say the file exists: the asset layer answers 304 whenever
// If-None-Match names the ETag of what it would serve, and for a miss that is the 404 page. So a 304 keeps the year
// only when the same request without its validators finds the file; otherwise the client gets that miss.
async function snapshotFile(request: Request, env: WorkerEnv): Promise<Response> {
  const response = await env.ASSETS.fetch(request);
  if (response.status !== 304) return withHeaders(response, snapshotHeaders(response.status === 200));
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const unconditional = await env.ASSETS.fetch(new Request(request, { headers }));
  if (unconditional.status !== 200) return withHeaders(unconditional, snapshotHeaders(false));
  await unconditional.body?.cancel();
  return withHeaders(response, snapshotHeaders(true));
}

export async function handle(
  request: Request,
  env: WorkerEnv,
  next: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/r/v/")) return snapshotFile(request, env);
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
