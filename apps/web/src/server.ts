import { env } from "cloudflare:workers";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { handleSiteRequest, type WorkerEnv } from "./server-behavior";

const securityHeaders = {
  "strict-transport-security": "max-age=31536000",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export default createServerEntry({
  async fetch(request) {
    const response = await handleSiteRequest(
      request,
      env as WorkerEnv,
      (pageRequest) => handler.fetch(pageRequest),
    );
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers });
  },
});
