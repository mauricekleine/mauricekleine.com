import { env } from "cloudflare:workers";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { handle, type WorkerEnv } from "./server-behavior";
import { themeScript } from "./site/theme-script";

const securityHeaders = {
  "strict-transport-security": "max-age=31536000",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

// The theme script goes in as the first child of <head>. React hoists the charset, the viewport and every
// stylesheet to the top of <head>, ahead of anything __root.tsx renders there, so the page itself cannot put it
// first; the Worker can, on every page it renders and every page the build prerenders through it.
const themeFirst = (response: Response) =>
  new HTMLRewriter()
    .on("head", {
      element(head) {
        head.prepend(`<script>${themeScript}</script>`, { html: true });
      },
    })
    .transform(response);

export default createServerEntry({
  async fetch(request) {
    let response = await handle(request, env as WorkerEnv, (pageRequest) => handler.fetch(pageRequest));
    if (response.headers.get("content-type")?.startsWith("text/html")) response = themeFirst(response);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
});
