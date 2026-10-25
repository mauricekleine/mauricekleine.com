import { fonts } from "@mauricekleine/superthread/fonts";

export interface WorkerEnv {
  ASSETS: { fetch(input: Request | URL): Promise<Response> };
}

// the worker: static assets, plus the font headers. /fonts/* reaches it first (cloudflare.config.ts), and each face
// carries its licence's CORS rule from packages/superthread/fonts.ts: the OFL faces to anyone, the ITF faces
// (Supreme, Erode) only to Maurice's own origins and to local development.
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

export async function handle(
  request: Request,
  env: WorkerEnv,
  next: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/fonts/")) return next(request);

  const response = await env.ASSETS.fetch(request);
  const fontRule = response.status < 400 ? fontHeaders(pathname, request.headers.get("origin")) : null;
  if (fontRule === null) return response;
  const headers = new Headers(response.headers);
  // the rule decides the CORS header alone, so nothing upstream can widen it
  headers.delete("access-control-allow-origin");
  for (const [name, value] of Object.entries(fontRule)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
